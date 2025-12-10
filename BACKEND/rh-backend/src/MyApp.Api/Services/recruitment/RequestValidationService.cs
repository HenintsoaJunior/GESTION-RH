using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment;

public interface IRequestValidationService
{
    Task<List<UserDto>> GetAllDirectorValidator(string requestId);
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
}
