using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment;

public interface IRequestService
{
    Task<(List<RequestListDTO>, int)> SearchRequests(FilterRequestListDTO filters, int page, int pageSize);
    Task AddRequest(RequestFormDTO data);
    Task<List<RequestStatus>> GetAllStatuses();
    Task<RequestDetailsDTO> GetRequestDetails(string id);
}

public class RequestService(
    IRequestRepository r1, ILogger<RequestService> log, IRequestValidationRepository r2,
    AppDbContext ctx
) : IRequestService
{
    private readonly ILogger<RequestService> _logger = log;
    private readonly IRequestRepository _repo = r1;
    private readonly IRequestValidationRepository _validationRepo = r2;
    private readonly AppDbContext _dbCtx = ctx;


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
        using var transaction = await _dbCtx.Database.BeginTransactionAsync();

        try {
            _logger.LogInformation("Insertion de la demande en cours ...");
            var request = await _repo.AddRequest(data);
            await _dbCtx.SaveChangesAsync();

            List<UserDto> usersDtos = await _validationRepo.GetAllDirectorValidator(request.Id);
            await _validationRepo.AddRequestInValidations(request, usersDtos);

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
            return await _repo.GetRequestDetails(id);
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la recherche des détails");
            throw;
        }
    }
}
