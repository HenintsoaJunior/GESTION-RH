using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment;

public interface IReplacementService
{
    Task AddReplacement(ReplacementReason data);
    Task DeleteReplacement(string id);
    Task<List<ReplacementReason>> GetAllReasons();
}

public class ReplacementService(
    IReplacementRepository r1, ILogger<ReplacementService> log
) : IReplacementService
{
    private readonly ILogger<ReplacementService> _logger = log;
    private readonly IReplacementRepository _repo = r1;

    public async Task AddReplacement(ReplacementReason data) {
        try {
            _logger.LogInformation("Insertion du motif de remplacement en cours ...");
            await _repo.AddReplacement(data);
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de l'insertion du motif de remplacement");
            throw;
        }
    }


    public async Task DeleteReplacement(string id) {
        try {
            _logger.LogInformation("Suppréssion du motif de remplacement en cours ...");
            await _repo.DeleteReplacement(id);
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la suppréssion du motif");
            throw;
        }
    }


    public async Task<List<ReplacementReason>> GetAllReasons() {
        try {
            _logger.LogInformation("Recherche des motifs de remplacement");
            return await _repo.GetAllReasons();
        }
        catch(Exception ex) {
            _logger.LogError(ex, "Erreur lors de la recherche des motifs");
            throw;
        }
    }
}
