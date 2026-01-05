using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.dto.notifications;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.recruitment;
using MyApp.Api.Repositories.users;
using MyApp.Api.Services.employee;
using MyApp.Api.Services.notifications;
using MyApp.Api.Services.users;

namespace MyApp.Api.Services.recruitment;

public interface IRequestService
{
    Task<(List<RequestListDTO>, int)> SearchRequests(FilterRequestListDTO filters, int page, int pageSize);
    Task AddRequest(RequestFormDTO data);
    Task<List<RequestStatus>> GetAllStatuses();
    Task<RequestDetailsDTO> GetRequestDetails(string id);
    Task<List<RequestValidationDTO>> GetValidationsWithSignatures(string id);
    Task<RequestEditDTO> GetById(string id);
    Task DeleteRequest(string requestId);
    Task UpdateRequest(string requestId, RequestFormDTO data);
    Task<RecruitmentRequest> GetRecruitmentRequestById(string requestId);
}

public class RequestService(
    IRequestRepository r1, ILogger<RequestService> log, IRequestValidationRepository r2,
    AppDbContext ctx, INotificationsService notif, IUserRepository userRepo, IEmployeeService emp
) : IRequestService
{
    private readonly ILogger<RequestService> _logger = log;
    private readonly IRequestRepository _repo = r1;
    private readonly IRequestValidationRepository _validationRepo = r2;
    private readonly AppDbContext _dbCtx = ctx;
    private readonly INotificationsService _notifService = notif;
    private readonly IUserRepository _userRepo = userRepo;
    private readonly IEmployeeService _empService = emp;


    public async Task<(List<RequestListDTO>, int)> SearchRequests(
        FilterRequestListDTO filters, int page, int pageSize
    ) {
        try {
            _logger.LogInformation("Recherche des demandes avec filtres, page={Page}, pageSize={PageSize}", page, pageSize);
            return await _repo.SearchRequests(filters, page, pageSize);
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la recherche des demandes");
            throw;
        }
    }


    public async Task AddRequest(RequestFormDTO data) {
        using var transaction = await _dbCtx.Database.BeginTransactionAsync();

        try {
            _logger.LogInformation("Insertion de la demande en cours ...");
            var request = await _repo.AddRequest(data);
            await _dbCtx.SaveChangesAsync();

            List<UserDto> usersDtos = await _validationRepo.GetAllDirectorValidator(request.Id);
            await _validationRepo.AddRequestInValidations(request, usersDtos);

        // Demandeur
            var requestor = await _userRepo.GetByIdAsync(data.ApplicantUserId)??
                throw new ArgumentException("Demandeur non trouvé");

        // Envoi de notification
            var notification = new NotificationFormDTO
            {
                Title = $"Nouvelle demande créée par {requestor.Name ?? "Inconnu"}",
                Message = $"Demande de recrutement au poste de '{data.Post}' en attente de validation.",
                Type = "recruitment",
                RelatedTable = "recruitment_requests",
                RelatedMenu = "collaborateur",
                RelatedId = request.Id,
                Priority = 2,
                UserIds = usersDtos.Select(u => u.UserId).ToList(),
                CreatedAt = DateTime.UtcNow
            };

            await _notifService.CreateAsync(notification, transaction);

            await _dbCtx.SaveChangesAsync();
            await transaction.CommitAsync();
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

            _logger.LogInformation("Demandeur : {p1}", request.ApplicantUser.Matricule);
            var empInfos = await _empService.GetByMatricule(request.ApplicantUser.Matricule)
             ?? throw new ArgumentException("Informations de l'employé non trouvées");

            details.Direction = empInfos.Direction?.DirectionName ?? "";
            details.Department = empInfos.Department?.DepartmentName?? "";
            details.Service = empInfos.Service?.ServiceName ?? "";

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
            if(!request.LastStatus.ToLower().Equals("brouillon")) {
                throw new Exception("Impossible de supprimer une demande en cours ou déjà validée");
            }
            await _repo.DeleteRequest(request);
        }   
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la suppréssion de la demande");
            throw;
        }
    }


    public async Task<List<RequestValidationDTO>> GetValidationsWithSignatures(string id) {
        try {
            _logger.LogInformation("Recherche des validations en cours ...");
            
            var directors = await _validationRepo.GetAllDirectorValidator(id);
            var requestValidations = await _validationRepo.GetAllValidation(id);

            var result = directors.Select(director =>
            {
                var validation = requestValidations
                    .FirstOrDefault(v => v.Validator.UserId == director.UserId);

                return new RequestValidationDTO {
                    Direction = director.Department ?? "",
                    ApplicantUser = director.Name,
                    SignatureBase64 = validation?.Signature!=null ? 
                        Convert.ToBase64String(validation.Signature) : null
                };
            }).ToList();

            return result;
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

        // Vérification du statut
            if(!lastRequest.LastStatus.ToLower().Equals("brouillon")) {
                throw new Exception("Impossible de modifier une demande en cours ou déjà validée");
            }

        // Vérification de la direction
            var applicant = await _userRepo.GetByIdAsync(data.ApplicantUserId)
             ?? throw new ArgumentException("Demandeur non trouvé");
            if(applicant.Department != lastRequest.ApplicantUser.Department) {
                throw new Exception("Impossible de modifier les demandes des autres directions");
            }

            await _repo.UpdateRequest(lastRequest, data);
            await _dbCtx.SaveChangesAsync();

            await transaction.CommitAsync();
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Erreur lors de la mise à jour de la demande");
            await transaction.RollbackAsync();
            throw;
        }
    }
}
