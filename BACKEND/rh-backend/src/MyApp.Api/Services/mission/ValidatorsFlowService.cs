using Microsoft.Extensions.Logging;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.validatorsflow;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IValidatorsFlowService
    {
        Task<(IEnumerable<ValidatorsFlow>, int)> SearchAsync(ValidatorsFlowSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<ValidatorsFlow>> GetAllAsync();
        Task<ValidatorsFlow?> GetByIdAsync(string id);
        Task<IEnumerable<ValidatorsFlow>> GetByUserIdAsync(string userId);
        Task<IEnumerable<ValidatorsFlow>> GetByTypeAndUserAsync(string validatorType, string userId);
        Task<IEnumerable<ValidatorsFlow>> GetByTypeAndSuperiorAsync(string validatorType, string superiorId);
        Task<IEnumerable<ValidatorsFlow>> GetByTypeAndBackupOrderAsync(string validatorType, int backupOrder);
        Task<ValidatorsFlow> AddAsync(ValidatorsFlowDTOForm dto);
        Task UpdateAsync(ValidatorsFlow validatorFlow);
        Task DeleteAsync(string id);
        Task DeleteByUserIdAsync(string userId);
        Task<ValidatorsFlow?> GetDirecteurTutelleAsync(string departement,string matricule);
        Task<ValidatorsFlow?> GetDirecteurRHAsync();
    }

    public class ValidatorsFlowService : IValidatorsFlowService
    {
        private readonly IValidatorsFlowRepository _repository;
        private readonly AppDbContext _context;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<ValidatorsFlowService> _logger;

        public ValidatorsFlowService(
            IValidatorsFlowRepository repository,
            AppDbContext context,
            ISequenceGenerator sequenceGenerator,
            ILogger<ValidatorsFlowService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<ValidatorsFlow?> GetDirecteurRHAsync()
        {
            return await _repository.GetDirecteurRHAsync();
        }

        public async Task<ValidatorsFlow?> GetDirecteurTutelleAsync(string departement,string matricule)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(departement))
                {
                    throw new ArgumentException("Le département ne peut pas être null ou vide", nameof(departement));
                }

                var directeur = await _repository.GetDirecteurTutelleAsync(departement,matricule);
                
                if (directeur == null)
                {
                    _logger.LogWarning("Aucun directeur de tutelle trouvé pour le département: {Departement}", departement);
                }
                else
                {
                    _logger.LogInformation("Directeur de tutelle trouvé: {ValidatorId} pour le département: {Departement}", 
                        directeur.ValidatorId, departement);
                }
                
                return directeur;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du directeur de tutelle pour le département: {Departement}", departement);
                throw;
            }
        }

        public async Task<(IEnumerable<ValidatorsFlow>, int)> SearchAsync(ValidatorsFlowSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                _logger.LogInformation("Recherche des validateurs avec filtres, page={Page}, pageSize={PageSize}", page, pageSize);
                return await _repository.SearchAsync(filters, page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche des validateurs");
                throw;
            }
        }

        public async Task<IEnumerable<ValidatorsFlow>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les validateurs");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des validateurs");
                throw;
            }
        }

        public async Task<ValidatorsFlow?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un validateur avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération du validateur avec l'ID: {ValidatorId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du validateur avec l'ID: {ValidatorId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<ValidatorsFlow>> GetByUserIdAsync(string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    throw new ArgumentException("L'ID utilisateur ne peut pas être null ou vide", nameof(userId));
                }

                _logger.LogInformation("Récupération des validateurs pour l'utilisateur: {UserId}", userId);
                return await _repository.GetByUserIdAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des validateurs pour l'utilisateur: {UserId}", userId);
                throw;
            }
        }

        public async Task<IEnumerable<ValidatorsFlow>> GetByTypeAndUserAsync(string validatorType, string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(validatorType))
                {
                    throw new ArgumentException("Le type de validateur ne peut pas être null ou vide", nameof(validatorType));
                }

                if (string.IsNullOrWhiteSpace(userId))
                {
                    throw new ArgumentException("L'ID utilisateur ne peut pas être null ou vide", nameof(userId));
                }

                _logger.LogInformation("Récupération des validateurs de type {ValidatorType} pour l'utilisateur: {UserId}", validatorType, userId);
                return await _repository.GetByTypeAndUserAsync(validatorType, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des validateurs de type {ValidatorType} pour l'utilisateur: {UserId}", validatorType, userId);
                throw;
            }
        }

        public async Task<IEnumerable<ValidatorsFlow>> GetByTypeAndSuperiorAsync(string validatorType, string superiorId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(validatorType))
                {
                    throw new ArgumentException("Le type de validateur ne peut pas être null ou vide", nameof(validatorType));
                }

                if (string.IsNullOrWhiteSpace(superiorId))
                {
                    throw new ArgumentException("L'ID du supérieur ne peut pas être null ou vide", nameof(superiorId));
                }

                _logger.LogInformation("Récupération des validateurs de type {ValidatorType} pour le supérieur: {SuperiorId}", validatorType, superiorId);
                return await _repository.GetByTypeAndSuperiorAsync(validatorType, superiorId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des validateurs de type {ValidatorType} pour le supérieur: {SuperiorId}", validatorType, superiorId);
                throw;
            }
        }

        public async Task<IEnumerable<ValidatorsFlow>> GetByTypeAndBackupOrderAsync(string validatorType, int backupOrder)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(validatorType))
                {
                    throw new ArgumentException("Le type de validateur ne peut pas être null ou vide", nameof(validatorType));
                }

                if (backupOrder < 0)
                {
                    throw new ArgumentException("L'ordre de backup ne peut pas être négatif", nameof(backupOrder));
                }

                _logger.LogInformation("Récupération des validateurs de type {ValidatorType} avec backup order: {BackupOrder}", validatorType, backupOrder);
                return await _repository.GetByTypeAndBackupOrderAsync(validatorType, backupOrder);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des validateurs de type {ValidatorType} avec backup order: {BackupOrder}", validatorType, backupOrder);
                throw;
            }
        }

        public async Task<ValidatorsFlow> AddAsync(ValidatorsFlowDTOForm dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (dto == null)
                {
                    throw new ArgumentNullException(nameof(dto), "Le DTO de validateur ne peut pas être null");
                }

                // Vérifier si un validateur avec le même type, utilisateur et backup order existe déjà
                var existingValidators = await _repository.GetByTypeAndBackupOrderAsync(dto.ValidatorType, dto.BackupOrder);
                if (existingValidators.Any(v => v.UserId == dto.UserId))
                {
                    throw new InvalidOperationException($"Un validateur avec le type '{dto.ValidatorType}', l'utilisateur '{dto.UserId}' et l'ordre de backup '{dto.BackupOrder}' existe déjà.");
                }

                var validatorId = _sequenceGenerator.GenerateSequence("seq_validator_id", "VAL", 6, "-");

                var validatorFlow = new ValidatorsFlow(dto) { ValidatorId = validatorId };

                await _repository.AddAsync(validatorFlow);
                await _repository.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Validateur ajouté avec succès avec l'ID: {ValidatorId}", validatorFlow.ValidatorId);
                return validatorFlow;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de l'ajout du validateur");
                throw;
            }
        }

        public async Task UpdateAsync(ValidatorsFlow validatorFlow)
        {
            try
            {
                if (validatorFlow == null)
                {
                    throw new ArgumentNullException(nameof(validatorFlow), "Le validateur ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(validatorFlow.ValidatorId))
                {
                    throw new ArgumentException("L'ID du validateur ne peut pas être null ou vide", nameof(validatorFlow.ValidatorId));
                }

                // Vérifier si un autre validateur avec le même type, utilisateur et backup order existe déjà
                var existingValidators = await _repository.GetByTypeAndBackupOrderAsync(validatorFlow.ValidatorType, validatorFlow.BackupOrder);
                var duplicate = existingValidators.FirstOrDefault(v => 
                    v.ValidatorId != validatorFlow.ValidatorId && 
                    v.UserId == validatorFlow.UserId);
                
                if (duplicate != null)
                {
                    throw new InvalidOperationException($"Un autre validateur avec le type '{validatorFlow.ValidatorType}', l'utilisateur '{validatorFlow.UserId}' et l'ordre de backup '{validatorFlow.BackupOrder}' existe déjà.");
                }

                await _repository.UpdateAsync(validatorFlow);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Validateur mis à jour avec succès pour l'ID: {ValidatorId}", validatorFlow.ValidatorId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du validateur avec l'ID: {ValidatorId}", validatorFlow?.ValidatorId);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID du validateur ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Validateur supprimé avec succès pour l'ID: {ValidatorId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du validateur avec l'ID: {ValidatorId}", id);
                throw;
            }
        }

        public async Task DeleteByUserIdAsync(string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    throw new ArgumentException("L'ID utilisateur ne peut pas être null ou vide", nameof(userId));
                }

                await _repository.DeleteByUserIdAsync(userId);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Tous les validateurs supprimés avec succès pour l'utilisateur: {UserId}", userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression des validateurs pour l'utilisateur: {UserId}", userId);
                throw;
            }
        }
    }
}