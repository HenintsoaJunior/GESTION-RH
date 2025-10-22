using MyApp.Api.Entities.prevision;
using MyApp.Api.Models.dto.prevision;
using MyApp.Api.Repositories.prevision;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;
namespace MyApp.Api.Services.prevision;

public interface IPrevisionPriceService
{
    Task<IEnumerable<PrevisionPrice>> GetAllAsync();
    Task<PrevisionPrice?> GetByIdAsync(string id);
    Task AddAsync(PrevisionPriceDtoForm dto);
    Task UpdateAsync(string id, PrevisionPriceDtoForm dto);
    Task DeleteAsync(string id);
}

public class PrevisionPriceService : IPrevisionPriceService
{
    private readonly IPrevisionPriceRepository _repository;
    private readonly ILogService _logService;
    private readonly ISequenceGenerator _sequenceGenerator;
    private readonly ILogger<PrevisionPriceService> _logger;

    public PrevisionPriceService(
        IPrevisionPriceRepository repository,
        ILogService logService,
        ISequenceGenerator sequenceGenerator,
        ILogger<PrevisionPriceService> logger)
    {
        _repository = repository;
        _logService = logService;
        _sequenceGenerator = sequenceGenerator;
        _logger = logger;
    }

    public async Task<IEnumerable<PrevisionPrice>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Récupération de tous les prevision_price");
            return await _repository.GetAllAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des prevision_price");
            throw;
        }
    }

    public async Task<PrevisionPrice?> GetByIdAsync(string id)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Tentative de récupération d'un prevision_price avec un ID null ou vide");
                return null;
            }

            _logger.LogInformation("Récupération du prevision_price avec l'ID: {PrevisionId}", id);
            return await _repository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération du prevision_price avec l'ID: {PrevisionId}", id);
            throw;
        }
    }

    public async Task AddAsync(PrevisionPriceDtoForm dto)
    {
        try
        {
            var previsionPrice = new PrevisionPrice(dto);

            if (string.IsNullOrWhiteSpace(previsionPrice.PrevisionId))
            {
                previsionPrice.PrevisionId = _sequenceGenerator.GenerateSequence("seq_prevision_id", "PRV", 6, "-");
            }

            await _repository.AddAsync(previsionPrice);
            await _repository.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de l'ajout du prevision_price");
            throw;
        }
    }

    public async Task UpdateAsync(string id, PrevisionPriceDtoForm dto)
    {
        try
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
            {
                throw new InvalidOperationException($"Le prevision_price avec l'ID {id} n'existe pas");
            }

            var updated = new PrevisionPrice(dto)
            {
                PrevisionId = id
            };

            await _repository.UpdateAsync(updated);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("PrevisionPrice mis à jour avec succès pour l'ID: {PrevisionId}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la mise à jour du prevision_price avec l'ID: {PrevisionId}", id);
            throw;
        }
    }

    public async Task DeleteAsync(string id)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("L'ID du prevision_price ne peut pas être null ou vide", nameof(id));
            }

            var existing = await _repository.GetByIdAsync(id);

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("PrevisionPrice supprimé avec succès pour l'ID: {PrevisionId}", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la suppression du prevision_price avec l'ID: {PrevisionId}", id);
            throw;
        }
    }
}