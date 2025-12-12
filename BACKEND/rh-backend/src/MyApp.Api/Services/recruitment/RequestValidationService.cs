using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment;

public interface IRequestValidationService
{
    Task<List<UserDto>> GetAllDirectorValidator(string requestId);
    Task DoValidationForRequest(CreateRequestValidationDTO data);
    Task<(List<RequestDetailsDTO>, int)> GetAllPendedRecruitmentRequest(
        string validatorId, int page, int pageSize
    );
}

public class RequestValidationService(
    IRequestValidationRepository r1, ILogger<RequestValidationService> log
) : IRequestValidationService
{
    private readonly ILogger<RequestValidationService> _logger = log;
    private readonly IRequestValidationRepository _repo = r1;


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


    public async Task DoValidationForRequest(CreateRequestValidationDTO data) {
        try {
            _logger.LogInformation("En cours de faire la validation ...");
            await _repo.DoValidationForRequest(data);
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la validation");
            throw;
        }
    }


    public async Task<(List<RequestDetailsDTO>, int)> GetAllPendedRecruitmentRequest(
        string validatorId, int page, int pageSize
    ) {
        try {
            _logger.LogInformation("Recherche des demandes en attente ...");
            return await _repo.GetAllPendedRecruitmentRequest(
                validatorId, page, pageSize
            );
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la recherche des demandes en attente");
            throw;
        }
    }
}
