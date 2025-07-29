using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.employee;
using MyApp.Api.Repositories.employee;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.employee
{
    public interface IMaritalStatusService
    {
        Task<IEnumerable<MaritalStatus>> GetAllAsync();
        Task<MaritalStatus?> GetByIdAsync(string id);
        Task AddAsync(MaritalStatus maritalStatus);
        Task UpdateAsync(string id, MaritalStatus maritalStatus);
        Task DeleteAsync(string id);
    }

    public class MaritalStatusService : IMaritalStatusService
    {
        private readonly IMaritalStatusRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<MaritalStatusService> _logger;

        public MaritalStatusService(
            IMaritalStatusRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<MaritalStatusService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<MaritalStatus>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les statuts matrimoniaux");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statuts matrimoniaux");
                throw;
            }
        }

        public async Task<MaritalStatus?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un statut matrimonial avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération du statut matrimonial avec l'ID: {MaritalStatusId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du statut matrimonial avec l'ID: {MaritalStatusId}", id);
                throw;
            }
        }

        public async Task AddAsync(MaritalStatus maritalStatus)
        {
            try
            {
                if (maritalStatus == null)
                {
                    throw new ArgumentNullException(nameof(maritalStatus), "Le statut matrimonial ne peut pas être null");
                }

                maritalStatus.MaritalStatusId = _sequenceGenerator.GenerateSequence("seq_marital_status_id", "MS", 6, "-");
                _logger.LogInformation("ID généré pour le statut matrimonial: {MaritalStatusId}", maritalStatus.MaritalStatusId);

                await _repository.AddAsync(maritalStatus);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Statut matrimonial ajouté avec succès avec l'ID: {MaritalStatusId}", maritalStatus.MaritalStatusId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout du statut matrimonial");
                throw;
            }
        }

        public async Task UpdateAsync(string id, MaritalStatus maritalStatus)
        {
            try
            {
                if (maritalStatus == null)
                {
                    throw new ArgumentNullException(nameof(maritalStatus), "Le statut matrimonial ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID du statut matrimonial ne peut pas être null ou vide", nameof(id));
                }

                var existingMaritalStatus = await _repository.GetByIdAsync(id);
                if (existingMaritalStatus == null)
                {
                    throw new ArgumentException("Le statut matrimonial n'existe pas", nameof(id));
                }

                maritalStatus.MaritalStatusId = id; // Conserver l'ID existant
                await _repository.UpdateAsync(maritalStatus);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Statut matrimonial mis à jour avec succès pour l'ID: {MaritalStatusId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du statut matrimonial avec l'ID: {MaritalStatusId}", id);
                throw;
            }
        }
        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID du statut matrimonial ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Statut matrimonial supprimé avec succès pour l'ID: {MaritalStatusId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du statut matrimonial avec l'ID: {MaritalStatusId}", id);
                throw;
            }
        }
    }
}