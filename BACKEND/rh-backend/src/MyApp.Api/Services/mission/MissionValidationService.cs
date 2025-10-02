using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.list.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.logs; 
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IMissionValidationService
    {
        Task<(IEnumerable<MissionValidation>, int)> GetRequestAsync(string userId, int page, int pageSize, string? employeeId = null, string? status = null);
        Task<string?> ValidateAsync(Validation validation, MissionBudgetDTOForm missionBudget);
        Task<MissionValidation?> VerifyMissionValidationByMissionIdAsync(string missionId);
        Task<(IEnumerable<MissionValidation>, int)> SearchAsync(MissionValidationSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<MissionValidation>> GetAllAsync();
        Task<IEnumerable<MissionValidation?>?> GetByAssignationIdAsync(string assignationId);
        Task<MissionValidation?> GetByIdAsync(string id);
        Task<string> CreateAsync(MissionValidationDTOForm missionValidation, string userId);
        Task<bool> UpdateAsync(string id, MissionValidationDTOForm missionValidation, string userId);
        Task<bool> DeleteAsync(string id, string userId);
        Task<bool> UpdateStatusAsync(string id, string status, string userId);
        Task<IEnumerable<MissionValidation>> GetByMissionIdAsync(string missionId);
        Task<bool> CancelValidationsByMissionIdAsync(string missionId, string userId);
        Task<bool> RejectedAsync(string missionValidationId, string missionAssignationId, string userId);
        Task<MissionStatsValidation> GetStatisticsAsync(string? matricule = null);
    }

    public class MissionValidationService : IMissionValidationService
    {
        private readonly IMissionValidationRepository _repository;
        private readonly IMissionAssignationService _missionAssignationService;
        private readonly IMissionBudgetService _missionBudgetService;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<MissionValidationService> _logger; // Updated to use MissionValidationService
        private readonly ILogService _logService; // Added ILogService

        public MissionValidationService(
            IMissionValidationRepository repository,
            IMissionAssignationService missionAssignationService,
            IMissionBudgetService missionBudgetService,
            ISequenceGenerator sequenceGenerator,
            ILogger<MissionValidationService> logger,
            ILogService logService)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _missionAssignationService = missionAssignationService ?? throw new ArgumentNullException(nameof(missionAssignationService));
            _missionBudgetService = missionBudgetService ?? throw new ArgumentNullException(nameof(missionBudgetService));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
        }

        public async Task<bool> RejectedAsync(string missionValidationId, string missionAssignationId, string userId)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(missionValidationId) || string.IsNullOrWhiteSpace(missionAssignationId) || string.IsNullOrWhiteSpace(userId))
                {
                    throw new ArgumentException("Les paramètres missionValidationId, missionAssignationId et userId ne peuvent pas être null ou vides");
                }

                var missionValidation = await _repository.GetByIdAsync(missionValidationId);
                if (missionValidation == null || missionValidation.MissionAssignationId != missionAssignationId)
                {
                    return false;
                }

                var originalMissionValidation = new MissionValidation
                {
                    MissionValidationId = missionValidation.MissionValidationId,
                    MissionId = missionValidation.MissionId,
                    MissionAssignationId = missionValidation.MissionAssignationId,
                    Status = missionValidation.Status,
                    ValidationDate = missionValidation.ValidationDate,
                };

                var result = await _repository.RejectedAsync(missionValidationId, missionAssignationId);
                if (!result)
                {
                    return false;
                }

                var updatedMissionValidation = await _repository.GetByIdAsync(missionValidationId);

                await _logService.LogAsync("REJET VALIDATION MISSION", originalMissionValidation, updatedMissionValidation, userId, "Status");

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du rejet de la validation de mission {MissionValidationId} pour missionAssignationId {MissionAssignationId}",
                    missionValidationId, missionAssignationId);
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> CancelValidationsByMissionIdAsync(string missionId, string userId)
        {
            try
            {
                var validations = await _repository.GetByMissionIdAsync(missionId);

                if (validations == null || !validations.Any())
                {
                    return true;
                }

                foreach (var validation in validations)
                {
                    var oldValidation = new MissionValidation
                    {
                        Status = validation.Status,
                    };
                    if (validation.Status != "Annulé")
                    {
                        validation.Status = "Annulé";
                        validation.UpdatedAt = DateTime.UtcNow;

                        await _repository.UpdateAsync(validation);

                        await _logService.LogAsync(
                            "ANNULATION VALIDATION MISSION",
                            oldValidation,
                            validation,
                            userId,
                            "Status"
                        );
                    }
                }
                await _repository.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur fatale lors de l'annulation des validations de la mission {MissionId}.", missionId);
                throw;
            }
        }
        public async Task<IEnumerable<MissionValidation>> GetByMissionIdAsync(string missionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(missionId))
                {
                    _logger.LogWarning("Tentative de récupération des validations de mission avec un ID de mission null ou vide");
                    return [];
                }

                _logger.LogInformation("Récupération des validations de mission pour l'ID de mission: {MissionId}", missionId);
                return await _repository.GetByMissionIdAsync(missionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des validations de mission pour l'ID de mission {MissionId}", missionId);
                throw;
            }
        }

        public async Task<(IEnumerable<MissionValidation>, int)> GetRequestAsync(string userId, int page, int pageSize, string? employeeId = null, string? status = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    throw new ArgumentException("L'ID de l'utilisateur ne peut pas être null ou vide", nameof(userId));
                }

                if (page < 1 || pageSize < 1)
                {
                    throw new ArgumentException("Les paramètres de pagination doivent être supérieurs à 0", nameof(page));
                }

                var (results, totalCount) = await _repository.GetRequestAsync(userId, page, pageSize, employeeId, status);
                return (results, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des demandes pour userId: {UserId}, employeeId: {EmployeeId}, status: {Status}",
                    userId, employeeId ?? "none", status ?? "none");
                throw;
            }
        }

        public async Task<string?> ValidateAsync(Validation validation, MissionBudgetDTOForm missionBudget)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                string? result = null;
                var lastValidation = await _repository.ValidateAsync(validation.MissionValidationId, validation.MissionAssignationId);
                // valider les demandes 
                if (!lastValidation) result = "Validation effectuée avec succès.";
                var missionAssignation = await _missionAssignationService.GetByAssignationIdAsync(validation.MissionAssignationId);
                if (missionAssignation == null) result = "Aucune validation à faire.";

                //si validation par DRH
                if (lastValidation && missionAssignation != null)
                {
                    missionAssignation.IsValidated = 1;
                    //changer le isValidated de ce mission assignation en 1
                    await _missionAssignationService.UpdateAsync(validation.MissionAssignationId, missionAssignation);
                    result = "Validation effectuée avec succès et mission validée";

                    await _missionAssignationService.GeneratePaiementsAsync(
                            missionAssignation.EmployeeId,
                            missionAssignation.MissionId);

                    //check si budget mission est suffisant
                    // if (validation.Type.Equals("Indemnité"))
                    // {
                    //     var expense = (await _missionAssignationService.GeneratePaiementsAsync(
                    //         missionAssignation.EmployeeId,
                    //         missionAssignation.MissionId)).TotalAmount;

                    //     if (expense > missionBudget.Budget && !validation.IsSureToConfirm)
                    //     {
                    //         // result = "Attention Budget insuffisant!!!!";
                    //         throw new Exception("Budget insuffisant!!!!");
                    //     }

                    //     //mis à jour du budget
                    //     await _missionBudgetService.AddAsync(new MissionBudgetDTOForm
                    //     {
                    //         DirectionName = missionBudget.DirectionName,
                    //         Budget = missionBudget.Budget - expense,
                    //         UserId = missionBudget.UserId
                    //     });
                    // }
                }
                // Log the creation
                var missionValidation = await _repository.GetByIdAsync(validation.MissionValidationId);

                //mis a jour du budget de mission 
                await _logService.LogAsync("VALIDATION DE MISSION", null, missionValidation, validation.UserId, "ValidationDate");

                await transaction.CommitAsync();
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la validation de mission missionValidationId={MissionValidationId}, missionAssignationId={MissionAssignationId}",
                    validation.MissionValidationId, validation.MissionAssignationId);
                await transaction.RollbackAsync();
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
                return await _repository.GetByAssignationIdAsync(assignationId);
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
                   throw new ArgumentException("L'ID de la validation de mission ne peut pas être null ou vide", nameof(id));
                }

                var existingMissionValidation = await _repository.GetByIdAsync(id);
                if (existingMissionValidation == null)
                {
                    return false;
                }

                await _repository.DeleteAsync(existingMissionValidation);
                await _repository.SaveChangesAsync();

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
        
        public async Task<MissionStatsValidation> GetStatisticsAsync(string? matricule = null)
        {
            try
            {
                return await _repository.GetStatisticsAsync(matricule);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statistiques des missions avec matricule filter: {Matricule}", matricule != null ? string.Join(", ", matricule) : "none");
                throw;
            }
        }
    }
}