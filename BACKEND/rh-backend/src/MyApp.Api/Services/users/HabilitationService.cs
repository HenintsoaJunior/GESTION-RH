using MyApp.Api.Entities.users;
using MyApp.Api.Repositories.users;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.users;

public interface IHabilitationService
    {
        Task<IEnumerable<Habilitation>> GetAllAsync();
        Task<Habilitation?> GetByIdAsync(string id);
        Task AddAsync(Habilitation habilitation);
        Task UpdateAsync(Habilitation habilitation);
        Task DeleteAsync(string id);
    }

    public class HabilitationService : IHabilitationService
    {
        private readonly IHabilitationRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<HabilitationService> _logger;

        public HabilitationService(
            IHabilitationRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<HabilitationService> logger)
        {
            _repository = repository;
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

        public async Task AddAsync(Habilitation habilitation)
        {
            try
            {
                if (habilitation == null)
                {
                    throw new ArgumentNullException(nameof(habilitation), "L'habilitation ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(habilitation.HabilitationId))
                {
                    habilitation.HabilitationId = _sequenceGenerator.GenerateSequence("seq_habilitation_id", "HAB", 6, "-");
                    _logger.LogInformation("ID généré pour l'habilitation: {HabilitationId}", habilitation.HabilitationId);
                }

                await _repository.AddAsync(habilitation);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Habilitation ajoutée avec succès avec l'ID: {HabilitationId}", habilitation.HabilitationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout de l'habilitation avec l'ID: {HabilitationId}", habilitation?.HabilitationId);
                throw;
            }
        }

        public async Task UpdateAsync(Habilitation habilitation)
        {
            try
            {
                if (habilitation == null)
                {
                    throw new ArgumentNullException(nameof(habilitation), "L'habilitation ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(habilitation.HabilitationId))
                {
                    throw new ArgumentException("L'ID de l'habilitation ne peut pas être null ou vide", nameof(habilitation.HabilitationId));
                }

                await _repository.UpdateAsync(habilitation);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Habilitation mise à jour avec succès pour l'ID: {HabilitationId}", habilitation.HabilitationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'habilitation avec l'ID: {HabilitationId}", habilitation?.HabilitationId);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID de l'habilitation ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Habilitation supprimée avec succès pour l'ID: {HabilitationId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'habilitation avec l'ID: {HabilitationId}", id);
                throw;
            }
        }
    }