using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.dto.notifications;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.recruitment;
using MyApp.Api.Repositories.users;
using MyApp.Api.Services.notifications;
using MyApp.Api.Services.users;

namespace MyApp.Api.Services.recruitment;

public interface IRequestValidationService
{
    Task<List<UserDto>> GetAllDirectorValidator(string requestId);
    Task ValidateRequest(CreateRequestValidationDTO data);
    Task<(List<RequestDetailsDTO>, int)> GetAllPendedRecruitmentRequest(
        string validatorId, FilterRequestListDTO filters, int page, int pageSize
    );
    Task<bool> HasRequestsToValidate(string userId);
}

public class RequestValidationService(
    IRequestValidationRepository r1, ILogger<RequestValidationService> log,
    INotificationsService notif, IRecruitmentRequestService s2
) : IRequestValidationService 
{
    private readonly ILogger<RequestValidationService> _logger = log;
    private readonly IRequestValidationRepository _repo = r1;
    private readonly INotificationsService _notifService = notif;
    private readonly IRecruitmentRequestService _reqService = s2;


    public async Task<List<UserDto>> GetAllDirectorValidator(string requestId) {
        try {
            _logger.LogInformation("Recherche des directeurs validateurs");
            return await _repo.GetAllDirectorValidator(requestId);
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la recherche des directeurs");
            throw;
        }
    }


    public async Task ValidateRequest(CreateRequestValidationDTO data) {
        try {
            _logger.LogInformation("En cours de faire la validation ...");
            var request = await _repo.ValidateRequest(data);

        // Le prochain validateur seulement
            var validators = await _reqService.GetNextValidator(data.RequestId);
            List<string> validatorsIds = [];

            if(validators!=null) {
                validatorsIds.Add(validators.UserId);

                var notification = new NotificationFormDTO
                {
                    Title = $"Une nouvelle demande de recrutement a été créée",
                    Message = $"Demande de recrutement au poste de '{request.Post}' en attente de votre validation.",
                    Type = "recruitment",
                    RelatedTable = "recruitment_requests",
                    RelatedMenu = "collaborateur",
                    RelatedId = request.Id,
                    Priority = 2,
                    UserIds = validatorsIds,
                    CreatedAt = DateTime.UtcNow
                };
                await _notifService.CreateAsync(notification, null);
            }
            else {
                var notification = new NotificationFormDTO
                {
                    Title = $"Votre demande de recrutement est validée",
                    Message = $"Votre demande de recrutement au poste de '{request.Post}' est complètement validée .",
                    Type = "recruitment",
                    RelatedTable = "recruitment_requests",
                    RelatedMenu = "collaborateur",
                    RelatedId = request.Id,
                    Priority = 2,
                    UserIds = [request.ApplicantUser.UserId],
                    CreatedAt = DateTime.UtcNow
                };
                await _notifService.CreateAsync(notification, null);
            }
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la validation");
            throw;
        }
    }


    public async Task<(List<RequestDetailsDTO>, int)> GetAllPendedRecruitmentRequest(
        string validatorId, FilterRequestListDTO filters, int page, int pageSize
    ) {
        try {
            _logger.LogInformation("Recherche des demandes en attente ...");

            return await _repo.GetAllPendedRecruitmentRequest(
                validatorId, filters, page, pageSize
            );
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la recherche des demandes en attente");
            throw;
        }
    }


    public async Task<bool> HasRequestsToValidate(string userId) {
        FilterRequestListDTO filters = new();
        try {
            _logger.LogInformation("Vérification de l'accès de l'utilisateur ...");
            var (requests, count) = await _repo.GetAllPendedRecruitmentRequest(
                userId, filters, 1, 5
            );

            return count > 0;
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la recherche des demandes en attente");
            throw;
        }
    }

}
