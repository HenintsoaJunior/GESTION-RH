using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.users;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.users;

public interface IHabitationGroupService
{
    Task<IEnumerable<HabilitationGroup>> GetAllAsync();
    Task<HabilitationGroup?> GetByIdAsync(string id);
    Task AddAsync(HabilitationGroupDTOForm dto, string userId);
    Task UpdateAsync(string id, HabilitationGroupDTOForm dto, string userId);
    Task DeleteAsync(string id, string userId);
}

public class HabitationGroupService : IHabitationGroupService
{
    private readonly IHabitationGroupRepository _repository;
    private readonly ILogService _logService;
    private readonly ISequenceGenerator _sequenceGenerator;
    private readonly ILogger<HabitationGroupService> _logger;

    public HabitationGroupService(
        IHabitationGroupRepository repository,
        ILogService logService,
        ISequenceGenerator sequenceGenerator,
        ILogger<HabitationGroupService> logger)
    {
        _repository = repository;
        _logService = logService;
        _sequenceGenerator = sequenceGenerator;
        _logger = logger;
    }

    public async Task<IEnumerable<HabilitationGroup>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Récupération de tous les groupes d'habilitation");
            return await _repository.GetAllAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des groupes d'habilitation");
            throw;
        }
    }

    public async Task<HabilitationGroup?> GetByIdAsync(string id)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Tentative de récupération d'un groupe d'habilitation avec un ID null ou vide");
                return null;
            }

            _logger.LogInformation("Récupération du groupe d'habilitation avec l'ID: {GroupId}", id);
            return await _repository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération du groupe d'habilitation avec l'ID: {GroupId}", id);
            throw;
        }
    }

    public async Task AddAsync(HabilitationGroupDTOForm dto, string userId)
    {
        try
        {
            var group = new HabilitationGroup(dto);

            if (string.IsNullOrWhiteSpace(group.GroupId))
            {
                group.GroupId = _sequenceGenerator.GenerateSequence("seq_habilitation_group_id", "HGRP", 6, "-");
                _logger.LogInformation("ID généré pour le groupe d'habilitation: {GroupId}", group.GroupId);
            }

            await _repository.AddAsync(group);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Groupe d'habilitation ajouté avec succès avec l'ID: {GroupId}", group.GroupId);

            // === Ajout dans les logs ===
            await _logService.LogAsync("INSERTION", null, group, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de l'ajout du groupe d'habilitation");
            throw;
        }
    }

    public async Task UpdateAsync(string id, HabilitationGroupDTOForm dto, string userId)
    {
        try
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
            {
                throw new InvalidOperationException($"Le groupe d'habilitation avec l'ID {id} n'existe pas");
            }

            var updated = new HabilitationGroup(dto)
            {
                GroupId = id
            };

            await _repository.UpdateAsync(updated);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Groupe d'habilitation mis à jour avec succès pour l'ID: {GroupId}", id);

            // === Ajout dans les logs ===
            await _logService.LogAsync("MODIFICATION", existing, updated, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la mise à jour du groupe d'habilitation avec l'ID: {GroupId}", id);
            throw;
        }
    }

    public async Task DeleteAsync(string id, string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("L'ID du groupe d'habilitation ne peut pas être null ou vide", nameof(id));
            }

            var existing = await _repository.GetByIdAsync(id);

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Groupe d'habilitation supprimé avec succès pour l'ID: {GroupId}", id);

            // === Ajout dans les logs ===
            await _logService.LogAsync("SUPPRESSION", existing, null, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la suppression du groupe d'habilitation avec l'ID: {GroupId}", id);
            throw;
        }
    }
}