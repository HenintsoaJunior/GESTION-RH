using DocumentFormat.OpenXml.Spreadsheet;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.dto.notifications;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.recruitment;
using MyApp.Api.Repositories.users;
using MyApp.Api.Services.employee;
using MyApp.Api.Services.logs;
using MyApp.Api.Services.notifications;

namespace MyApp.Api.Services.recruitment;

public interface IRecruitmentRequestService
{
    Task<(List<RequestListDTO>, int)> SearchRequests(FilterRequestListDTO filters,
     string currentUserEmail, int page, int pageSize);
    Task<string> AddRequest(RequestFormDTO data);
    Task<List<RequestStatus>> GetAllStatuses();
    Task<RequestDetailsDTO> GetRequestDetails(string id);
    Task<List<RequestValidationDTO>> GetValidationsByRequestId(string id);
    Task<RequestEditDTO> GetById(string id);
    Task DeleteRequest(string requestId);
    Task UpdateRequest(string requestId, RequestFormDTO data);
    Task<RecruitmentRequest> GetRecruitmentRequestById(string requestId);
}

public class RecruitmentRequestService(
    IRecruitmentRequestRepository r1, ILogger<RecruitmentRequestService> log, IRequestValidationRepository r2,
    AppDbContext ctx, INotificationsService notif, IUserRepository userRepo, IEmployeeService emp,
    ILogService logService
) : IRecruitmentRequestService
{
    private readonly ILogger<RecruitmentRequestService> _logger = log;
    private readonly IRecruitmentRequestRepository _repo = r1;
    private readonly IRequestValidationRepository _validationRepo = r2;
    private readonly AppDbContext _dbCtx = ctx;
    private readonly INotificationsService _notifService = notif;
    private readonly IUserRepository _userRepo = userRepo;
    private readonly IEmployeeService _empService = emp;
    private readonly ILogService _logService = logService;


    public async Task<(List<RequestListDTO>, int)> SearchRequests(
        FilterRequestListDTO filters, string currentUserEmail, int page, int pageSize
    ) {
        try {
            _logger.LogInformation("Recherche des demandes avec filtres, page={Page}, pageSize={PageSize}", page, pageSize);
            return await _repo.SearchRequests(filters, currentUserEmail, page, pageSize);
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la recherche des demandes");
            throw;
        }
    }


    public async Task<string> AddRequest(RequestFormDTO data) {
        using var transaction = await _dbCtx.Database.BeginTransactionAsync();

        try {
            _logger.LogInformation("Insertion de la demande en cours ...");
            var request = await _repo.AddRequest(data);
            await _dbCtx.SaveChangesAsync();

        // Demandeur
            var requestor = await _userRepo.GetByIdAsync(data.ApplicantUserId)??
                throw new ArgumentException("Demandeur non trouvé");

        // Tous les validateurs en même temps
            List<UserDto> validators = await _validationRepo.GetAllDirectorValidator(request.Id);
            await _validationRepo.AddRequestInValidations(request, validators);
            List<string> validatorsIds = validators.Select(u => u.UserId).ToList();
            
        // // Le validateur suivant seulement
        //     var validators = await _validationRepo.GetNextValidator(request.Id);
        //     List<string> validatorsIds = [];
            
            if(validators!=null) {
                // validatorsIds.Add(validators.UserId);

                var notification = new NotificationFormDTO
                {
                    Title = $"Nouvelle demande créée par {requestor.Name ?? "Inconnu"}",
                    Message = $"Demande de recrutement au poste de '{data.Post}' en attente de validation.",
                    Type = "recruitment",
                    RelatedTable = "recruitment_requests",
                    RelatedMenu = "collaborateur",
                    RelatedId = request.Id,
                    Priority = 2,
                    UserIds = validatorsIds,
                    CreatedAt = DateTime.UtcNow
                };

            // Envoi de notification
                await _notifService.CreateAsync(notification, transaction);
            }

            await _dbCtx.SaveChangesAsync();
            await transaction.CommitAsync();

        // LOG D'ACTION
            await _logService.LogAsync("INSERTION DEMANDE RECRUTEMENT", 
                null, request, request.CreatorId
            );

            return request.Id;
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de l'insertion de la demande");
            await transaction.RollbackAsync();
            throw;
        }
    }


    public async Task<List<RequestStatus>> GetAllStatuses() {
        try {
            _logger.LogInformation("Recherche des statuts de demande");
            return await _repo.GetAllStatuses();
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la recherche des statuts");
            throw;
        }
    }


    public async Task<RequestDetailsDTO> GetRequestDetails(string id) {
        try {
            _logger.LogInformation("Recherche des détails de la demande en cours ...");
            var details = await _repo.GetRequestDetails(id);

            var request = await _repo.GetRecruitmentRequestById(id);

            var empInfos = new Employee();
            empInfos = await _empService.GetByMatricule(request.ApplicantUser.Matricule);

            if(empInfos==null) {
                var superior = await _userRepo.GetByIdAsync(request.ApplicantUser.SuperiorId??"");
                empInfos = await _empService.GetByMatricule(superior?.Matricule??"");
            }

            details.Direction = empInfos?.Direction?.DirectionName ?? "";
            details.Department = empInfos?.Department?.DepartmentName?? "";
            details.Service = empInfos?.Service?.ServiceName ?? "";

            return details;
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la recherche des détails");
            throw;
        }
    }


    public async Task DeleteRequest(string requestId) {
        try {
            _logger.LogInformation("Suppréssion de la demande ...");

            var request = await _repo.GetRecruitmentRequestById(requestId);
            if(!request.LastStatus.ToLower().Equals("en attente")) {
                throw new Exception("Impossible de supprimer une demande en cours ou déjà validée");
            }
            await _repo.DeleteRequest(request);
        }   
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la suppréssion de la demande");
            throw;
        }
    }


    public async Task<List<RequestValidationDTO>> GetValidationsByRequestId(string id) {
        try {
            _logger.LogInformation("Recherche des validations en cours ...");
            
            var directors = await _validationRepo.GetAllDirectorValidator(id);
            var requestValidations = await _validationRepo.GetAllValidation(id);

        // Validations dans bases de données
            var validationsDb = requestValidations.Select(validation => {
                return new RequestValidationDTO {
                    Direction = validation.Validator.Department ?? "",
                    Validator = validation.Validator.Name ?? "",
                    Status = validation?.Status.Name ?? "",
                    ValidatedAt = validation?.CreatedAt
                };
            }).Skip(1).ToList();

        // Validations par requête
            var validations = directors.Select(director => {
                var validation = requestValidations
                    .FirstOrDefault(v => v.Validator.UserId == director.UserId);

                return new RequestValidationDTO {
                    Direction = director.Department ?? "",
                    Validator = director.Name,
                    Status = validation?.Status.Name,
                    ValidatedAt = validation?.CreatedAt
                };
            }).ToList();

            return validationsDb.Count == directors.Count ? validationsDb : validations;
        }   
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la recherche des validations");
            throw;
        }
    }


    public async Task<RecruitmentRequest> GetRecruitmentRequestById(string requestId) {
        return await _repo.GetRecruitmentRequestById(requestId);
    }


    public async Task<RequestEditDTO> GetById(string id) {
        return await _repo.GetById(id);
    }


    public async Task UpdateRequest(string requestId, RequestFormDTO data) {
        using var transaction = await _dbCtx.Database.BeginTransactionAsync();

        try {
            _logger.LogInformation("Mise à jour de la demande en cours ...");
            var lastRequest = await GetRecruitmentRequestById(requestId);
            var lastEntity = lastRequest;

        // Vérification du statut
            if(!lastRequest.LastStatus.ToLower().Equals("en attente")) {
                throw new Exception("Impossible de modifier une demande en cours ou déjà validée");
            }

        // Vérification de la direction
            var applicant = await _userRepo.GetByIdAsync(data.HierarchicalManagerId)
             ?? throw new ArgumentException("Demandeur non trouvé");
            
            bool isAdmin = applicant.UserRoles.Any(u => u.RoleId == "ROLE_001");
            bool sameDepartment = applicant.Department == lastRequest.HierarchicalManager.Department;

            if(!isAdmin && !sameDepartment) {
                throw new Exception("Impossible de modifier les demandes des autres directions");
            }

            await _repo.UpdateRequest(lastRequest, data);
            await _dbCtx.SaveChangesAsync();

            await transaction.CommitAsync();

            await _logService.LogAsync("MODIFICATION DEMANDE RECRUTEMENT", 
                lastEntity, lastRequest, lastEntity.CreatorId
            );
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Erreur lors de la mise à jour de la demande");
            await transaction.RollbackAsync();
            throw;
        }
    }
}
