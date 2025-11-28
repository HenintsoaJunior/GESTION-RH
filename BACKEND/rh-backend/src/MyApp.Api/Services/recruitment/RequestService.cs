using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment;

public interface IRequestService
{
    Task<(List<RequestListDTO>, int)> SearchRequests(FilterRequestListDTO filters, int page, int pageSize);
    Task AddRequest(RequestFormDTO data);
}

public class RequestService(
    IRequestRepository r1, ILogger<RequestService> log
) : IRequestService
{
    private readonly ILogger<RequestService> _logger = log;
    private readonly IRequestRepository _repo = r1;

    public async Task<(List<RequestListDTO>, int)> SearchRequests(FilterRequestListDTO filters, int page, int pageSize) {
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
        try {
            _logger.LogInformation("Insertion de la demande en cours ...");
            await _repo.AddRequest(data);
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de l'insertion de la demande");
            throw;
        }
    }
}
