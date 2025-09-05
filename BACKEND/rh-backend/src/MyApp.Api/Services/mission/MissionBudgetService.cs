using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission;

public interface IMissionBudgetService
{
    Task<IEnumerable<MissionBudget>> GetAllAsync();
    Task<MissionBudget?> GetByIdAsync(string id);
    Task<MissionBudget?> GetByDirectionNameAsync(string directionName);
    Task AddAsync(MissionBudgetDTOForm dto);
    Task UpdateAsync(string id, MissionBudgetDTOForm dto);
    Task DeleteAsync(string id, string userId);
}

public class MissionBudgetService : IMissionBudgetService
{
    private readonly IMissionBudgetRepository _repository;
    private readonly ILogService _logService;
    private readonly ISequenceGenerator _sequenceGenerator;
    private readonly ILogger<MissionBudgetService> _logger;

    public MissionBudgetService(
        IMissionBudgetRepository repository,
        ILogService logService,
        ISequenceGenerator sequenceGenerator,
        ILogger<MissionBudgetService> logger)
    {
        _repository = repository;
        _logService = logService;
        _sequenceGenerator = sequenceGenerator;
        _logger = logger;
    }

    public async Task<IEnumerable<MissionBudget>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Récupération de tous les budgets de mission");
            return await _repository.GetAllAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des budgets de mission");
            throw;
        }
    }

    public async Task<MissionBudget?> GetByIdAsync(string id)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Tentative de récupération d'un budget mission avec un ID null ou vide");
                return null;
            }

            _logger.LogInformation("Récupération du budget mission avec l'ID: {MissionBudgetId}", id);
            return await _repository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération du budget mission avec l'ID: {MissionBudgetId}", id);
            throw;
        }
    }

    public async Task<MissionBudget?> GetByDirectionNameAsync(string directionName)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(directionName))
            {
                _logger.LogWarning("Tentative de récupération avec un directionName null ou vide");
                return null;
            }

            _logger.LogInformation("Récupération des budgets mission pour la direction: {DirectionName}", directionName);
            return await _repository.GetByDirectionNameAsync(directionName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des budgets mission par directionName: {DirectionName}", directionName);
            throw;
        }
    }

    public async Task AddAsync(MissionBudgetDTOForm dto)
    {
        try
        {
            var missionBudget = new MissionBudget(dto);

            if (string.IsNullOrWhiteSpace(missionBudget.MissionBudgetId))
            {
                missionBudget.MissionBudgetId = _sequenceGenerator.GenerateSequence("seq_mission_budget_id", "MBG", 6, "-");
                _logger.LogInformation("ID généré pour MissionBudget: {MissionBudgetId}", missionBudget.MissionBudgetId);
            }
            await _repository.AddAsync(missionBudget);
            _logger.LogInformation("MissionBudget ajouté avec succès avec l'ID: {MissionBudgetId}", missionBudget.MissionBudgetId);
            await _logService.LogAsync("INSERTION", null, missionBudget, missionBudget.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de l'ajout du budget mission");
            throw;
        }
    }

    public async Task UpdateAsync(string id, MissionBudgetDTOForm dto)
    {
        try
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
            {
                throw new InvalidOperationException($"Le MissionBudget avec l'ID {id} n'existe pas");
            }
            var updated = new MissionBudget(dto);
            await _repository.UpdateAsync(updated);
            _logger.LogInformation("MissionBudget mis à jour avec succès pour l'ID: {MissionBudgetId}", id);

            // === Ajout dans les logs ===
            await _logService.LogAsync("MODIFICATION", existing, updated, updated.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la mise à jour du MissionBudget avec l'ID: {MissionBudgetId}", id);
            throw;
        }
    }

    public async Task DeleteAsync(string id, string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("L'ID du MissionBudget ne peut pas être null ou vide", nameof(id));
            }

            var existing = await _repository.GetByIdAsync(id);

            await _repository.DeleteAsync(id);

            _logger.LogInformation("MissionBudget supprimé avec succès pour l'ID: {MissionBudgetId}", id);

            // === Ajout dans les logs ===
            await _logService.LogAsync("SUPPRESSION", existing, null, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la suppression du MissionBudget avec l'ID: {MissionBudgetId}", id);
            throw;
        }
    }
}
