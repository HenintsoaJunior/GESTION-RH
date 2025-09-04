using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.logs; // Add this for ILogService
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IMissionValidationService
    {
        Task<IEnumerable<MissionValidation>> GetRequestAsync();
        Task<bool> ValidateAsync(string missionValidationId, string missionAssignationId, string userId);
        Task<MissionValidation?> VerifyMissionValidationByMissionIdAsync(string missionId);
        Task<(IEnumerable<MissionValidation>, int)> SearchAsync(MissionValidationSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<MissionValidation>> GetAllAsync();
        Task<IEnumerable<MissionValidation?>?> GetByAssignationIdAsync(string assignationId);
        Task<MissionValidation?> GetByIdAsync(string id);
        Task<string> CreateAsync(MissionValidationDTOForm missionValidation, string userId); // Modified to include userId
        Task<bool> UpdateAsync(string id, MissionValidationDTOForm missionValidation, string userId); // Modified to include userId
        Task<bool> DeleteAsync(string id, string userId); // Modified to include userId
        Task<bool> UpdateStatusAsync(string id, string status, string userId); // Modified to include userId
    }

    public class MissionValidationService : IMissionValidationService
    {
        private readonly IMissionValidationRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<MissionValidationService> _logger; // Updated to use MissionValidationService
        private readonly ILogService _logService; // Added ILogService

        public MissionValidationService(
            IMissionValidationRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<MissionValidationService> logger,
            ILogService logService) // Added ILogService to constructor
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
        }

        public async Task<IEnumerable<MissionValidation>> GetRequestAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les demandes de validation de mission");
                return await _repository.GetRequestAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des demandes");
                throw;
            }
        }

        public async Task<bool> ValidateAsync(string missionValidationId, string missionAssignationId, string userId)
        {
            try
            {
                var result = await _repository.ValidateAsync(missionValidationId, missionAssignationId);
                _logger.LogInformation(
                    "Validation effectuée pour missionValidationId={MissionValidationId}, missionAssignationId={MissionAssignationId}",
                    missionValidationId, missionAssignationId);
                // Log the creation
                var missionValidation = await _repository.GetByIdAsync(missionValidationId);
                await _logService.LogAsync("VALIDATION DE MISSION", null, missionValidation, userId);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la validation de mission missionValidationId={MissionValidationId}, missionAssignationId={MissionAssignationId}",
                    missionValidationId, missionAssignationId);
                throw;
            }
        }

        public async Task<MissionValidation?> VerifyMissionValidationByMissionIdAsync(string missionId)
        {
            try
            {
                _logger.LogInformation("Vérification de la validation de mission pour missionId={MissionId}", missionId);
                var filters = new MissionValidationSearchFiltersDTO
                {
                    MissionId = missionId
                };
                var (result, total) = await _repository.SearchAsync(filters, 1, 1);
                return result.FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification de la validation de mission pour missionId={MissionId}", missionId);
                throw;
            }
        }

        public async Task<(IEnumerable<MissionValidation>, int)> SearchAsync(MissionValidationSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                _logger.LogInformation("Recherche des validations de mission avec filtres");
                return await _repository.SearchAsync(filters, page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche des validations de mission");
                throw;
            }
        }

        public async Task<IEnumerable<MissionValidation>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les validations de mission");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les validations de mission");
                throw;
            }
        }
        
        public async Task<IEnumerable<MissionValidation?>?> GetByAssignationIdAsync(string assignationId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(assignationId))
                {
                    _logger.LogWarning("Tentative de récupération d'une validation de mission avec un assignationId null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de la validation de mission pour assignationId={AssignationId}", assignationId);

                var filters = new MissionValidationSearchFiltersDTO
                {
                    MissionAssignationId = assignationId
                };

                var (result, total) = await _repository.SearchAsync(filters, 1, 1);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la validation de mission avec assignationId={AssignationId}", assignationId);
                throw;
            }
        }


        public async Task<MissionValidation?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'une validation de mission avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de la validation de mission avec l'ID: {MissionValidationId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la validation de mission {MissionValidationId}", id);
                throw;
            }
        }

        public async Task<string> CreateAsync(MissionValidationDTOForm? missionValidationDto, string userId)
        {
            try
            {
                if (missionValidationDto == null)
                {
                    _logger.LogWarning("Tentative de création avec un MissionValidationDTOForm null");
                    throw new ArgumentNullException(nameof(missionValidationDto), "Les données de la validation de mission ne peuvent pas être nulles");
                }

                var missionValidationId = _sequenceGenerator.GenerateSequence("seq_mission_validation_id", "MVAL", 6, "-");
                var missionValidation = new MissionValidation(missionValidationDto)
                {
                    MissionValidationId = missionValidationId
                };

                await _repository.AddAsync(missionValidation);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Validation de mission créée avec l'ID: {MissionValidationId}", missionValidationId);

                // Log the creation
                await _logService.LogAsync("INSERTION", null, missionValidation, userId);

                return missionValidationId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la validation de mission");
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id, MissionValidationDTOForm? missionValidationDto, string userId)
        {
            try
            {
                if (missionValidationDto == null)
                {
                    _logger.LogWarning("Tentative de mise à jour avec un MissionValidationDTOForm null");
                    throw new ArgumentNullException(nameof(missionValidationDto), "Les données de la validation de mission ne peuvent pas être nulles");
                }

                var existingMissionValidation = await _repository.GetByIdAsync(id);
                if (existingMissionValidation == null)
                {
                    _logger.LogWarning("Validation de mission avec l'ID {MissionValidationId} n'existe pas", id);
                    throw new InvalidOperationException($"La validation de mission avec l'ID {id} n'existe pas");
                }

                var newMissionValidation = new MissionValidation(missionValidationDto)
                {
                    MissionValidationId = id
                };

                await _repository.UpdateAsync(newMissionValidation);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Validation de mission mise à jour avec succès avec l'ID: {MissionValidationId}", id);

                // Log the modification
                await _logService.LogAsync("MODIFICATION", existingMissionValidation, newMissionValidation, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la validation de mission {MissionValidationId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string id, string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de suppression avec un ID null ou vide");
                    throw new ArgumentException("L'ID de la validation de mission ne peut pas être null ou vide", nameof(id));
                }

                var existingMissionValidation = await _repository.GetByIdAsync(id);
                if (existingMissionValidation == null)
                {
                    _logger.LogWarning("Validation de mission avec l'ID {MissionValidationId} n'existe pas", id);
                    return false;
                }

                await _repository.DeleteAsync(existingMissionValidation);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Validation de mission supprimée avec succès avec l'ID: {MissionValidationId}", id);

                // Log the deletion
                await _logService.LogAsync("SUPPRESSION", existingMissionValidation, null, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la validation de mission {MissionValidationId}", id);
                throw;
            }
        }

        public async Task<bool> UpdateStatusAsync(string id, string status, string userId)
        {
            try
            {
                var existingMissionValidation = await _repository.GetByIdAsync(id);
                if (existingMissionValidation == null)
                {
                    _logger.LogWarning("Validation de mission avec l'ID {MissionValidationId} n'existe pas", id);
                    return false;
                }

                var originalMissionValidation = new MissionValidation
                {
                    MissionValidationId = existingMissionValidation.MissionValidationId,
                    MissionId = existingMissionValidation.MissionId,
                    // Copy other properties as needed
                };

                var result = await _repository.UpdateStatusAsync(id, status);
                if (result)
                {
                    _logger.LogInformation("Statut de la validation de mission {MissionValidationId} mis à jour à {Status}", id, status);

                    // Log the status update
                    await _logService.LogAsync("MODIFICATION_STATUS", originalMissionValidation, existingMissionValidation, userId);
                }
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du statut de la validation de mission {MissionValidationId}", id);
                throw;
            }
        }
    }
}