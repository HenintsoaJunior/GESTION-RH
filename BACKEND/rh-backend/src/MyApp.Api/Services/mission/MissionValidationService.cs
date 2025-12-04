using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.list.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.logs;
using MyApp.Api.Services.users;
using MyApp.Api.Utils.generator;
using MyApp.Api.Services.notifications;
using MyApp.Api.Models.classes.notifications;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.notifications;
using MyApp.Api.enums;
using MyApp.Api.Extensions;

namespace MyApp.Api.Services.mission
{
    public interface IMissionValidationService
    {
        Task<(IEnumerable<MissionValidation>, int)> GetRequestAsync(string userId, int page, int pageSize, RequestFilterDto requestFilterDto);
        Task<string?> ValidateAsync(Validation validation, MissionBudgetDTOForm missionBudget);
        Task<MissionValidation?> VerifyMissionValidationByMissionIdAsync(string missionId);
        Task<(IEnumerable<MissionValidation>, int)> SearchAsync(MissionValidationSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<MissionValidation>> GetAllAsync();
        Task<MissionValidation?> GetByIdAsync(string id);
        Task<string> CreateAsync(MissionValidationDTOForm missionValidation, string userId);
        Task<bool> UpdateAsync(string id, MissionValidationDTOForm missionValidation, string userId);
        Task<bool> DeleteAsync(string id, string userId);
        Task<bool> UpdateStatusAsync(string id, string status, string userId);
        Task<IEnumerable<MissionValidation>> GetByMissionIdAsync(string missionId);
        Task<bool> CancelValidationsByMissionIdAsync(string missionId, string userId);
        Task<bool> RejectedAsync(string missionValidationId, string missionId, string userId); // Changé
        Task<MissionStatsValidation> GetStatisticsAsync(string? matricule = null);
        Task<bool> HasAnyValidatorValidatedAsync(string missionId);
        Task<bool> HasValidationLineAsync(string userId);
        Task<int> GetPendingMissionsCountAsync();
        Task<(double Rate, DateTime Date)> GetValidationRateAsync();
    }

    public class MissionValidationService : IMissionValidationService
    {
        private readonly IMissionValidationRepository _repository;
        private readonly IMissionRepository _missionRepository;
        private readonly IMissionBudgetService _missionBudgetService;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly IUserService _userService;
        private readonly ILogger<MissionValidationService> _logger;
        private readonly ILogService _logService;
        private readonly INotificationsService _notificationsService;
        private readonly EmailSender _emailSender;
        private readonly IRoleService _roleService;
        private readonly IMissionPaiementService _missionService;

        public MissionValidationService(
            IMissionValidationRepository repository,
            IMissionRepository missionRepository,
            IMissionBudgetService missionBudgetService,
            ISequenceGenerator sequenceGenerator,
            IUserService userService,
            ILogger<MissionValidationService> logger,
            ILogService logService,
            INotificationsService notificationsService,
            EmailSender emailSender,
            IMissionPaiementService missionService,
            IRoleService roleService)
        {
            _missionService = missionService ?? throw new ArgumentNullException(nameof(missionService));
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _missionRepository = missionRepository ?? throw new ArgumentNullException(nameof(missionRepository));
            _missionBudgetService = missionBudgetService ?? throw new ArgumentNullException(nameof(missionBudgetService));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
            _notificationsService = notificationsService ?? throw new ArgumentNullException(nameof(notificationsService));
            _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));
            _roleService = roleService ?? throw new ArgumentNullException(nameof(roleService));
        }

        public async Task<bool> HasValidationLineAsync(string userId)
            => string.IsNullOrWhiteSpace(userId) ? false : await _repository.HasValidationLineAsync(userId);

        public async Task<bool> HasAnyValidatorValidatedAsync(string missionId)
        {
            if (string.IsNullOrWhiteSpace(missionId)) return false;
            var validations = await GetByMissionIdAsync(missionId);
            return validations.Any(v => v.Status == "approved" || v.ValidationDate.HasValue);
        }

        public async Task<bool> CancelValidationsByMissionIdAsync(string missionId, string userId)
        {
            var validations = await _repository.GetByMissionIdAsync(missionId);
            if (!validations.Any()) return true;

            foreach (var v in validations)
            {
                var validatorName = await GetUserNameAsync(v.ToWhom);
                var oldData = new { v.Status, v.ValidationDate, v.Type, Validateur = validatorName };

                if (v.Status != "Annulé")
                {
                    v.Status = "Annulé";
                    v.UpdatedAt = DateTime.UtcNow;
                    await _repository.UpdateAsync(v);
                }

                var newData = new { v.Status, v.ValidationDate, v.Type, Validateur = validatorName };
            }

            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<MissionValidation>> GetByMissionIdAsync(string missionId)
            => string.IsNullOrWhiteSpace(missionId) ? [] : await _repository.GetByMissionIdAsync(missionId);

        public async Task<(IEnumerable<MissionValidation>, int)> GetRequestAsync(string userId, int page, int pageSize, RequestFilterDto requestFilterDto)
            => await _repository.GetRequestAsync(userId, page, pageSize, requestFilterDto);

        public async Task<bool> RejectedAsync(string missionValidationId, string missionId, string userId)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                var validation = await _repository.GetByIdAsync(missionValidationId);
                if (validation == null || validation.MissionId != missionId) return false;

                var oldData = new { validation.Status, validation.ValidationDate, validation.Type };
                var success = await _repository.RejectedAsync(missionValidationId);
                if (!success) return false;

                var mission = await _missionRepository.GetByIdAsync(missionId);
                if (mission != null)
                {
                    mission.Status = MissionStatus.MissionRejected;
                    mission.UpdatedAt = DateTime.UtcNow;
                    await _missionRepository.UpdateAsync(mission);
                    await _missionRepository.SaveChangesAsync();
                }

                var validatorName = await GetUserNameAsync(validation.ToWhom);
                var updatedValidation = await _repository.GetByIdAsync(missionValidationId);
                var newData = new { updatedValidation?.Status, updatedValidation?.ValidationDate, updatedValidation?.Type };

                await _logService.LogAsync("REJET", "MISSION_VALIDATION", oldData, newData, userId, "Status,ValidationDate,Type");

                // Notification au missionnaire
                if (!string.IsNullOrWhiteSpace(mission?.Employee.EmployeeCode))
                {
                    var missionnaire = await _userService.GetByMatriculeAsync(mission.Employee.EmployeeCode);
                    if (missionnaire != null)
                    {
                        var notification = new NotificationFormDTO
                        {
                            Title = $"Mission rejetée : {mission?.Name}",
                            Message = $"Votre mission a été rejetée par {validatorName}.",
                            Type = "mission_rejected",
                            RelatedTable = "mission",
                            RelatedMenu = "collaborateur",
                            RelatedId = missionId,
                            Priority = 1,
                            UserIds = new List<string> { missionnaire.UserId },
                            CreatedAt = DateTime.UtcNow
                        };
                        await _notificationsService.CreateAsync(notification, transaction);
                    }
                }

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur rejet validation {ValidationId} pour mission {MissionId}", missionValidationId, missionId);
                throw;
            }
        }

        public async Task<string?> ValidateAsync(Validation validation, MissionBudgetDTOForm missionBudget)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                var missionValidation = await _repository.GetByIdAsync(validation.MissionValidationId);
                if (missionValidation == null)
                {
                    _logger.LogWarning("Validation introuvable pour MissionValidationId: {MissionValidationId}", validation.MissionValidationId);
                    return "Validation introuvable.";
                }

                var validatorName = await GetUserNameAsync(missionValidation.ToWhom);
                var oldData = new { missionValidation.Status, missionValidation.ValidationDate, missionValidation.Type };

                var isFinalValidation = await _repository.ValidateAsync(validation.MissionValidationId);
                
                var mission = await _missionRepository.GetByIdAsync(missionValidation.MissionId);
                if (mission == null)
                {
                    _logger.LogWarning("Mission introuvable ({MissionId}) associée à la validation {MissionValidationId}", 
                        missionValidation.MissionId, validation.MissionValidationId);
                    return "Mission introuvable.";
                }

                string? result = "Validation effectuée avec succès.";

                if (isFinalValidation)
                {
                    mission.Status = MissionStatus.PaymentInProgress;
                    mission.UpdatedAt = DateTime.UtcNow;
                    await _missionRepository.UpdateAsync(mission);
                    await _missionRepository.SaveChangesAsync();
                    
                    result = "Validation finale effectuée – mission prête pour paiement.";

                    // Log pour déboguer
                    _logger.LogInformation(
                        "Vérification du type de validation: Type='{ValidationType}', " +
                        "MissionType={MissionType}, " +
                        "PaymentType.Indemnite int={(int)PaymentType.Indemnite}, " +
                        "PaymentType.NoteFrais int={(int)PaymentType.NoteFrais}",
                        validation.Type,
                        mission.MissionType,
                        (int)PaymentType.Indemnite,
                        (int)PaymentType.NoteFrais);

                   if (int.TryParse(validation.Type, out int typeInt))
                    {
                        _logger.LogDebug("Type de validation parsé en int: {TypeInt}", typeInt);
                        
                        if (typeInt == (int)PaymentType.Indemnite)
                        {
                            _logger.LogInformation(
                                "Type de validation détecté: INDEMNITÉ (int={TypeInt}) - Début génération des paiements pour indemnité - " +
                                "MissionId: {MissionId}, EmployeeId: {EmployeeId}", 
                                typeInt, mission.MissionId, mission.EmployeeId);
                            
                            try
                            {
                                await _missionService.GeneratePaiementsAsync(
                                    mission.EmployeeId,
                                    mission.MissionId);
                                
                                _logger.LogInformation(
                                    "Génération des paiements pour indemnité terminée avec succès - MissionId: {MissionId}", 
                                    mission.MissionId);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, 
                                    "Erreur lors de la génération des paiements pour indemnité - " +
                                    "MissionId: {MissionId}, Type: {Type}", 
                                    mission.MissionId, validation.Type);
                                throw;
                            }
                        }
                        
                        if (mission.MissionType == MissionType.International && 
                            typeInt == (int)PaymentType.NoteFrais)
                        {
                            _logger.LogInformation(
                                "Type de validation détecté: NOTE DE FRAIS INTERNATIONALE (int={TypeInt}) - " +
                                "Début génération des paiements pour note de frais internationale - " +
                                "MissionId: {MissionId}, EmployeeId: {EmployeeId}, MissionType: {MissionType}", 
                                typeInt, mission.MissionId, mission.EmployeeId, mission.MissionType);
                            
                            try
                            {
                                await _missionService.GeneratePaiementsAsync(
                                    mission.EmployeeId,
                                    mission.MissionId);
                                
                                _logger.LogInformation(
                                    "Génération des paiements pour note de frais internationale terminée avec succès - " +
                                    "MissionId: {MissionId}", 
                                    mission.MissionId);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, 
                                    "Erreur lors de la génération des paiements pour note de frais internationale - " +
                                    "MissionId: {MissionId}, Type: {Type}, MissionType: {MissionType}", 
                                    mission.MissionId, validation.Type, mission.MissionType);
                                throw;
                            }
                        }

                        // Log si aucune condition n'est remplie
                        if (typeInt != (int)PaymentType.Indemnite && 
                            !(mission.MissionType == MissionType.International && typeInt == (int)PaymentType.NoteFrais))
                        {
                            _logger.LogDebug(
                                "Aucune génération de paiement déclenchée - " +
                                "Type de validation: '{Type}' (int={TypeInt}), MissionType: {MissionType}", 
                                validation.Type, typeInt, mission.MissionType);
                        }
                    }
                    else
                    {
                        _logger.LogWarning(
                            "Impossible de parser le type de validation en int: '{Type}'. " +
                            "Attendu: valeurs numériques comme '1', '2', etc.",
                            validation.Type);
                    }

                    var recipientIds = new HashSet<string>();

                    if (!string.IsNullOrWhiteSpace(mission.Employee?.EmployeeCode))
                    {
                        var employeeUser = await _userService.GetByMatriculeAsync(mission.Employee.EmployeeCode);
                        if (employeeUser != null) 
                            recipientIds.Add(employeeUser.UserId);
                    }

                    var treasurers = await _roleService.GetUsersWithTreasuryRoleAsync();
                    foreach (var t in treasurers) 
                        recipientIds.Add(t.UserId);

                    if (recipientIds.Any())
                    {
                        var notif = new NotificationFormDTO
                        {
                            Title = $"Mission validée : {mission.Name}",
                            Message = $"La mission a été validée par {validatorName} et est prête pour le paiement.",
                            Type = "mission_validated",
                            RelatedTable = "mission",
                            RelatedMenu = "collaborateur",
                            RelatedId = mission.MissionId,
                            Priority = 2,
                            UserIds = recipientIds.ToList(),
                            CreatedAt = DateTime.UtcNow
                        };
                        await _notificationsService.CreateAsync(notif, transaction);
                    }
                }

                var updatedValidation = await _repository.GetByIdAsync(validation.MissionValidationId);
                var newData = new { updatedValidation?.Status, updatedValidation?.ValidationDate, updatedValidation?.Type };

                await _logService.LogAsync("VALIDATION", "MISSION_VALIDATION", oldData, newData, 
                    validation.UserId, "Status,ValidationDate,Type");

                await transaction.CommitAsync();
                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur validation {ValidationId}", validation.MissionValidationId);
                throw;
            }
        }
        
        public async Task<MissionValidation?> VerifyMissionValidationByMissionIdAsync(string missionId)
        {
            var filters = new MissionValidationSearchFiltersDTO { MissionId = missionId };
            var (results, _) = await _repository.SearchAsync(filters, 1, 1);
            return results.FirstOrDefault();
        }

        public Task<(IEnumerable<MissionValidation>, int)> SearchAsync(MissionValidationSearchFiltersDTO filters, int page, int pageSize)
            => _repository.SearchAsync(filters, page, pageSize);

        public Task<IEnumerable<MissionValidation>> GetAllAsync() => _repository.GetAllAsync();

        public Task<MissionValidation?> GetByIdAsync(string id)
            => string.IsNullOrWhiteSpace(id) ? Task.FromResult<MissionValidation?>(null) : _repository.GetByIdAsync(id);

        public async Task<string> CreateAsync(MissionValidationDTOForm dto, string userId)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var id = _sequenceGenerator.GenerateSequence("seq_mission_validation_id", "MVAL", 6, "-");
            var validation = new MissionValidation(dto) { MissionValidationId = id };

            await _repository.AddAsync(validation);
            await _repository.SaveChangesAsync();

            var validatorName = await GetUserNameAsync(dto.ToWhom);
            var logData = new { validation.MissionId, validation.Status, validation.Type, Validateur = validatorName };

            await _logService.LogAsync("INSERTION", "MISSION_VALIDATION", null, logData, userId, "MissionId,Status,Type,Validateur");
            return id;
        }

        public async Task<bool> UpdateAsync(string id, MissionValidationDTOForm dto, string userId)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));
            await using var transaction = await _repository.BeginTransactionAsync();

            var existing = await _repository.GetByIdAsync(id) ?? throw new InvalidOperationException("Validation introuvable");

            var oldName = await GetUserNameAsync(existing.ToWhom);
            var oldData = new { existing.MissionId, existing.Status, existing.Type, Validateur = oldName };

            var updated = new MissionValidation(dto) { MissionValidationId = id };
            await _repository.UpdateAsync(updated);
            await _repository.SaveChangesAsync();

            var newName = await GetUserNameAsync(updated.ToWhom);
            var newData = new { updated.MissionId, updated.Status, updated.Type, Validateur = newName };

            await _logService.LogAsync("MODIFICATION", "MISSION_VALIDATION", oldData, newData, userId, "MissionId,Status,Type,Validateur");
            await transaction.CommitAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string id, string userId)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            var validation = await _repository.GetByIdAsync(id);
            if (validation == null) return false;

            var validatorName = await GetUserNameAsync(validation.ToWhom);
            var oldData = new { validation.MissionId, validation.Status, validation.Type, Validateur = validatorName };

            await _repository.DeleteAsync(validation);
            await _repository.SaveChangesAsync();

            await _logService.LogAsync("SUPPRESSION", "MISSION_VALIDATION", oldData, null, userId, "MissionId,Status,Type,Validateur");
            await transaction.CommitAsync();
            return true;
        }

        public async Task<bool> UpdateStatusAsync(string id, string status, string userId)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            var validation = await _repository.GetByIdAsync(id);
            if (validation == null) return false;

            var oldName = await GetUserNameAsync(validation.ToWhom);
            var oldData = new { validation.Status, validation.ValidationDate, validation.Type, Validateur = oldName };

            var success = await _repository.UpdateStatusAsync(id, status);
            if (success)
            {
                var updated = await _repository.GetByIdAsync(id);
                var newName = await GetUserNameAsync(updated?.ToWhom);
                var newData = new { updated?.Status, updated?.ValidationDate, updated?.Type, Validateur = newName };
                await _logService.LogAsync("MODIFICATION_STATUS", "MISSION_VALIDATION", oldData, newData, userId, "Status,ValidationDate,Type");
            }

            await transaction.CommitAsync();
            return success;
        }

        public Task<MissionStatsValidation> GetStatisticsAsync(string? matricule = null)
            => _repository.GetStatisticsAsync(matricule);

        public Task<int> GetPendingMissionsCountAsync()
            => _repository.GetPendingMissionsCountAsync();

        public Task<(double Rate, DateTime Date)> GetValidationRateAsync()
            => _repository.GetValidationRateAsync();

        private async Task<string> GetUserNameAsync(string? userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) return "Inconnu";
            var user = await _userService.GetByIdAsync(userId);
            return user?.Name ?? "Inconnu";
        }
    }
}