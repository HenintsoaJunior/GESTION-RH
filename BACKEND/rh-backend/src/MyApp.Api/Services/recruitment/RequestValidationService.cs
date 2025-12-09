using MyApp.Api.Entities.users;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment;

public interface IRequestValidationService
{
    Task<List<User>> GetAllDirectors();
}

public class RequestValidationService(
    IRequestValidationRepository r1, ILogger<RequestValidationService> log
) : IRequestValidationService
{
    private readonly ILogger<RequestValidationService> _logger = log;
    private readonly IRequestValidationRepository _repo = r1;


    public async Task<List<User>> GetAllDirectors() {
        try {
            log.LogInformation("Recherche des directeurs");
            return await _repo.GetAllDirectors();
        }
        catch(Exception ex) {
            log.LogError(ex, "Erreur lors de la recherche des directeurs");
            throw;
        }
    }
}
