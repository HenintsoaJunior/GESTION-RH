using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.users;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.users;

public interface IHabilitationService
    {
        Task<IEnumerable<Habilitation>> GetAllAsync();
        Task<Habilitation?> GetByIdAsync(string id);
        Task AddAsync(HabilitationDTOForm dto, string userId);
        Task UpdateAsync(string id, HabilitationDTOForm dto,  string userId);
        Task DeleteAsync(string id, string userId);
    }

    public class HabilitationService : IHabilitationService
    {
        private readonly IHabilitationRepository _repository;
        private readonly ILogService _logService;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<HabilitationService> _logger;

        public HabilitationService(
            IHabilitationRepository repository,
            ILogService logService,
            ISequenceGenerator sequenceGenerator,
            ILogger<HabilitationService> logger)
        {
            _repository = repository;
            _logService = logService;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<Habilitation>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les habilitations");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des habilitations");
                throw;
            }
        }

        public async Task<Habilitation?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'une habilitation avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de l'habilitation avec l'ID: {HabilitationId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'habilitation avec l'ID: {HabilitationId}", id);
                throw;
            }
        }

        public async Task AddAsync(HabilitationDTOForm dto, string userId)
    {
        try
        {
            var habilitation = new Habilitation(dto);

            if (string.IsNullOrWhiteSpace(habilitation.HabilitationId))
            {
                habilitation.HabilitationId = _sequenceGenerator.GenerateSequence("seq_habilitation_id", "HAB", 6, "-");
                _logger.LogInformation("ID généré pour l'habilitation: {HabilitationId}", habilitation.HabilitationId);
            }

            await _repository.AddAsync(habilitation);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Habilitation ajoutée avec succès avec l'ID: {HabilitationId}", habilitation.HabilitationId);

            // === Ajout dans les logs ===
            await _logService.LogAsync("INSERTION", null, habilitation, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de l'ajout de l'habilitation");
            throw;
        }
    }

    public async Task UpdateAsync(string id, HabilitationDTOForm dto, string userId)
    {
        try
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
            {
                throw new InvalidOperationException($"L'habilitation avec l'ID {id} n'existe pas");
            }

            var updated = new Habilitation(dto)
            {
                HabilitationId = id
            };

            await _repository.UpdateAsync(updated);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Habilitation mise à jour avec succès pour l'ID: {HabilitationId}", id);

            // === Ajout dans les logs ===
            await _logService.LogAsync("MODIFICATION", existing, updated, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la mise à jour de l'habilitation avec l'ID: {HabilitationId}", id);
            throw;
        }
    }

    public async Task DeleteAsync(string id, string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("L'ID de l'habilitation ne peut pas être null ou vide", nameof(id));
            }

            var existing = await _repository.GetByIdAsync(id);

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Habilitation supprimée avec succès pour l'ID: {HabilitationId}", id);

            // === Ajout dans les logs ===
            await _logService.LogAsync("SUPPRESSION", existing, null, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la suppression de l'habilitation avec l'ID: {HabilitationId}", id);
            throw;
        }
    }
    }