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

namespace MyApp.Api.Services.mission
{
    public interface IMissionValidationService
    {
        Task<(IEnumerable<MissionValidation>, int)> GetRequestAsync(string userId, int page, int pageSize, RequestFilterDto requestFilterDto);
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
        Task<bool> HasAnyValidatorValidatedAsync(string missionId);
        Task<bool> HasValidationLineAsync(string userId);
        Task<int> GetPendingMissionsCountAsync();
        Task<(double Rate, DateTime Date)> GetValidationRateAsync();
    }
    public class MissionValidationService : IMissionValidationService
    {
        private readonly IMissionValidationRepository _repository;
        private readonly IMissionRepository _missionRepository; // Add this
        private readonly IMissionAssignationService _missionAssignationService;
        private readonly IMissionBudgetService _missionBudgetService;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly IUserService _userService;
        private readonly ILogger<MissionValidationService> _logger;
        private readonly ILogService _logService;
        private readonly INotificationsService _notificationsService; 
        private readonly EmailSender _emailSender; 
        private readonly IRoleService _roleService; 
        private readonly string _testEmail = "henintsoa.miantsafitia@hotmail.com"; 

        public MissionValidationService(
            IMissionValidationRepository repository,
            IMissionRepository missionRepository,
            IMissionAssignationService missionAssignationService,
            IMissionBudgetService missionBudgetService,
            ISequenceGenerator sequenceGenerator,
            IUserService userService,
            ILogger<MissionValidationService> logger,
            ILogService logService,
            INotificationsService notificationsService, 
            EmailSender emailSender, 
            IRoleService roleService) 
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _missionRepository = missionRepository ?? throw new ArgumentNullException(nameof(missionRepository)); // Add this
            _missionAssignationService = missionAssignationService ?? throw new ArgumentNullException(nameof(missionAssignationService));
            _missionBudgetService = missionBudgetService ?? throw new ArgumentNullException(nameof(missionBudgetService));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
            _notificationsService = notificationsService ?? throw new ArgumentNullException(nameof(notificationsService)); // Ajout
            _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender)); // Ajout
            _roleService = roleService ?? throw new ArgumentNullException(nameof(roleService)); // Ajout
        }
        public async Task<bool> HasValidationLineAsync(string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Tentative de vérification de ligne de validation avec un userId null ou vide");
                    return false;
                }
                return await _repository.HasValidationLineAsync(userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification de ligne de validation pour userId {UserId}", userId);
                throw;
            }
        }
        public async Task<bool> HasAnyValidatorValidatedAsync(string missionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(missionId))
                {
                    _logger.LogWarning("Tentative de vérification de validation avec un ID de mission null ou vide");
                    return false;
                }
                var validations = await GetByMissionIdAsync(missionId);
                return validations?.Any(v => v.Status == "approved" || v.ValidationDate.HasValue) ?? false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification si un validateur a déjà validé la mission {MissionId}", missionId);
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
                    var toWhomName = "Utilisateur inconnu";
                    if (!string.IsNullOrWhiteSpace(validation.ToWhom))
                    {
                        var toWhomUser = await _userService.GetByIdAsync(validation.ToWhom);
                        toWhomName = toWhomUser?.Name ?? "Utilisateur inconnu";
                    }
                    // Capturer l'état avant l'annulation
                    var oldValidation = new
                    {
                        Statut = (string?)validation.Status,
                        DateValidation = validation.ValidationDate,
                        Type = (string?)validation.Type,
                        NomValideur = toWhomName
                    };
                    if (validation.Status != "Annulé")
                    {
                        validation.Status = "Annulé";
                        validation.UpdatedAt = DateTime.UtcNow;
                        await _repository.UpdateAsync(validation);
                        if (!string.IsNullOrWhiteSpace(validation.ToWhom))
                        {
                            var toWhomUser = await _userService.GetByIdAsync(validation.ToWhom);
                            toWhomName = toWhomUser?.Name ?? "Utilisateur inconnu";
                        }
                        // Capturer l'état après l'annulation
                        var newValidation = new
                        {
                            Statut = (string?)validation.Status,
                            DateValidation = validation.ValidationDate,
                            Type = (string?)validation.Type,
                            NomValideur = toWhomName
                        };
                        // Log de l'annulation avec éléments essentiels
                        await _logService.LogAsync("ANNULATION", "MISSION_VALIDATION", oldValidation, newValidation, userId, "Statut,DateValidation,Type");
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
                return await _repository.GetByMissionIdAsync(missionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des validations de mission pour l'ID de mission {MissionId}", missionId);
                throw;
            }
        }
        public async Task<(IEnumerable<MissionValidation>, int)> GetRequestAsync(string userId, int page, int pageSize, RequestFilterDto requestFilterDto)
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
                var (results, totalCount) = await _repository.GetRequestAsync(userId, page, pageSize, requestFilterDto);
                return (results, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des demandes pour userId: {UserId}, employeeId: {EmployeeId}, status: {Status}",
                    userId, requestFilterDto.EmployeeId ?? "none", requestFilterDto.Status ?? "none");
                throw;
            }
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
                var oldMissionValidation = new
                {
                    Statut = (string?)missionValidation.Status,
                    DateValidation = missionValidation.ValidationDate,
                    Type = (string?)missionValidation.Type
                };
                var result = await _repository.RejectedAsync(missionValidationId, missionAssignationId);
                if (!result)
                {
                    return false;
                }
                var missionAssignation = await _missionAssignationService.GetByAssignationIdAsync(missionAssignationId);
                if (missionAssignation == null)
                {
                    throw new InvalidOperationException($"MissionAssignation introuvable: {missionAssignationId}");
                }
                var mission = await _missionRepository.GetByIdAsync(missionAssignation.MissionId);
                if (mission != null)
                {
                    mission.Status = "mission rejected";
                    mission.UpdatedAt = DateTime.UtcNow;
                    await _missionRepository.UpdateAsync(mission);
                    await _missionRepository.SaveChangesAsync();
                }
                var updatedMissionValidation = await _repository.GetByIdAsync(missionValidationId);
                if (updatedMissionValidation == null)
                {
                    throw new InvalidOperationException($"Validation de mission introuvable après mise à jour: {missionValidationId}");
                }
                var newMissionValidation = new
                {
                    Statut = (string?)updatedMissionValidation.Status,
                    DateValidation = updatedMissionValidation.ValidationDate,
                    Type = (string?)updatedMissionValidation.Type
                };
                await _logService.LogAsync("REJET", "MISSION_VALIDATION", oldMissionValidation, newMissionValidation, userId, "Statut,DateValidation,Type");

                // Ajout : Notifications et emails pour rejet (uniquement au missionnaire)
                if (missionAssignation.Employee != null && !string.IsNullOrWhiteSpace(missionAssignation.Employee.EmployeeCode))
                {
                    var missionnaireUser = await _userService.GetByMatriculeAsync(missionAssignation.Employee.EmployeeCode);
                    if (missionnaireUser != null && !string.IsNullOrWhiteSpace(missionnaireUser.Email))
                    {
                        // Récupérer le nom du validateur
                        var validatorName = "un validateur";
                        if (!string.IsNullOrWhiteSpace(missionValidation.ToWhom))
                        {
                            var validatorUser = await _userService.GetByIdAsync(missionValidation.ToWhom);
                            validatorName = validatorUser?.Name ?? "un validateur";
                        }

                        // Notification sur la plateforme (passer transaction pour éviter nested transaction)
                        var notification = new NotificationFormDTO
                        {
                            Title = $"Mission rejetée : {mission?.Name ?? "Mission inconnue"}",
                            Message = $"Votre mission a été rejetée par {validatorName}. Veuillez vérifier les détails et resoumettre si nécessaire.",
                            Type = "mission_rejected",
                            RelatedTable = "mission",
                            RelatedMenu = "collaborateur",
                            RelatedId = mission?.MissionId ?? missionAssignation.MissionId,
                            Priority = 1,
                            UserIds = new List<string> { missionnaireUser.UserId },
                            CreatedAt = DateTime.UtcNow
                        };
                        await _notificationsService.CreateAsync(notification, transaction);

                        // Email au missionnaire (hardcodé pour tests) - non transactionnel
                        string validatedDate = DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm");
                        string linkUrl = $"http://localhost:5183/missions/detail/{mission?.MissionId ?? missionAssignation.MissionId}";
                        await _emailSender.SendValidatorNotificationEmailAsync(
                            actionType: "rejection",
                            createdBy: userId,
                            role: "VALIDATOR",
                            createdDate: validatedDate,
                            status: "Rejetée",
                            toEmail: _testEmail, // Hardcodé pour non-déploiement
                            linkUrl: linkUrl,
                            subject: $"Mission rejetée - {mission?.Name ?? "Mission inconnue"}"
                        );
                    }
                }

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
        public async Task<string?> ValidateAsync(Validation validation, MissionBudgetDTOForm missionBudget)
        {
            _logger.LogInformation("Début de validation pour MissionValidationId: {MissionValidationId}, MissionAssignationId: {MissionAssignationId}",
                validation.MissionValidationId, validation.MissionAssignationId);
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                string? result = null;
                var missionValidation = await _repository.GetByIdAsync(validation.MissionValidationId);
                if (missionValidation == null)
                {
                    result = "Aucune validation trouvée.";
                    _logger.LogWarning("Validation non trouvée pour ID: {MissionValidationId}", validation.MissionValidationId);
                    await transaction.CommitAsync(); // Commit early if no validation
                    return result;
                }
                var toWhomName = "Utilisateur inconnu";
                if (!string.IsNullOrWhiteSpace(missionValidation.ToWhom))
                {
                    var toWhomUser = await _userService.GetByIdAsync(missionValidation.ToWhom);
                    toWhomName = toWhomUser?.Name ?? "Utilisateur inconnu";
                }
                // Capturer l'état avant la validation
                var oldMissionValidation = new
                {
                    Statut = (string?)missionValidation.Status,
                    DateValidation = missionValidation.ValidationDate,
                    Type = (string?)missionValidation.Type,
                    NomValideur = toWhomName
                };
                var lastValidation = await _repository.ValidateAsync(validation.MissionValidationId, validation.MissionAssignationId);
                if (!lastValidation)
                {
                    result = "Validation effectuée avec succès.";
                    _logger.LogInformation("Validation effectuée pour MissionValidationId: {MissionValidationId}", validation.MissionValidationId);
                }
                var missionAssignation = await _missionAssignationService.GetByAssignationIdAsync(validation.MissionAssignationId);
                if (missionAssignation == null)
                {
                    result = "Aucune validation à faire.";
                    _logger.LogWarning("MissionAssignation non trouvée pour ID: {MissionAssignationId}", validation.MissionAssignationId);
                    await transaction.CommitAsync(); // Commit early
                    return result;  // Early return to avoid null ref
                }
                var mission = await _missionRepository.GetByIdAsync(missionAssignation.MissionId);  // Use repo instead of service
                if (lastValidation && missionAssignation != null && mission != null)
                {
                    missionAssignation.IsValidated = 1;
                    mission.Status = "Payment in progress";
                    await _missionAssignationService.UpdateAsync(validation.MissionAssignationId, missionAssignation);
                    mission.UpdatedAt = DateTime.UtcNow;
                    await _missionRepository.UpdateAsync(mission);
                    await _missionRepository.SaveChangesAsync();
                    result = "Validation effectuée avec succès et mission validée";
                    _logger.LogInformation("Génération des paiements pour l'assignation de mission {MissionAssignationId} avec le type {Type} le Mission Type {missionType}",
                        missionAssignation.AssignationId, validation.Type,mission.MissionType);
                    if (validation.Type.Equals("Indemnité"))
                    {
                        await _missionAssignationService.GeneratePaiementsAsync(
                            missionAssignation.EmployeeId,
                            missionAssignation.MissionId);
                    }
                    if (mission.MissionType.Equals("international"))
                    {  
                        if (validation.Type.Equals("Note de frais"))
                        {
                            await _missionAssignationService.GenerateExpensePaiementsAsync(
                                missionAssignation.EmployeeId,
                                missionAssignation.MissionId
                            );
                        }
                       
                    }
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

                    // Ajout : Notifications et emails pour validation réussie (missionnaire et trésoriers)
                    var recipientUserIds = new HashSet<string>();
                    var recipientEmails = new List<string>();

                    // Missionnaire (collaborateur)
                    if (missionAssignation.Employee != null && !string.IsNullOrWhiteSpace(missionAssignation.Employee.EmployeeCode))
                    {
                        var missionnaireUser = await _userService.GetByMatriculeAsync(missionAssignation.Employee.EmployeeCode);
                        if (missionnaireUser != null)
                        {
                            recipientUserIds.Add(missionnaireUser.UserId);
                            if (!string.IsNullOrWhiteSpace(missionnaireUser.Email))
                            {
                                recipientEmails.Add(missionnaireUser.Email);

                                // Email au missionnaire (hardcodé pour tests)
                                string validatedDate = DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm");
                                string linkUrlMissionnaire = $"http://localhost:5183/missions/detail/{mission.MissionId}";
                                await _emailSender.SendCollaboratorValidatedEmailAsync(
                                    missionTitle: mission.Name,
                                    validatorName: toWhomName,
                                    validatedDate: validatedDate,
                                    status: "Validée",
                                    toEmail: _testEmail, // Hardcodé pour non-déploiement
                                    linkUrl: linkUrlMissionnaire
                                );
                            }
                        }
                    }

                    // Trésoriers
                    var treasurers = await _roleService.GetUsersWithTreasuryRoleAsync();
                    foreach (var treasurer in treasurers)
                    {
                        recipientUserIds.Add(treasurer.UserId);
                        if (!string.IsNullOrWhiteSpace(treasurer.Email))
                        {
                            recipientEmails.Add(treasurer.Email);

                            // Email au trésorier (hardcodé pour tests)
                            string validatedDateTreasurer = DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm");
                            string linkUrlTreasurer = $"http://localhost:5183/missions/to-pay/{mission.MissionId}";
                            await _emailSender.SendTreasurerNotificationEmailAsync(
                                missionTitle: mission.Name,
                                validatedBy: toWhomName,
                                validatedDate: validatedDateTreasurer,
                                toEmail: _testEmail, // Hardcodé pour non-déploiement
                                linkUrl: linkUrlTreasurer,
                                amount: null, // À adapter si montant total disponible
                                status: "Validée - Prête pour paiement"
                            );
                        }
                    }

                    // Notification sur la plateforme (missionnaire + trésoriers) - passer transaction pour éviter nested transaction
                    if (recipientUserIds.Any())
                    {
                        var notification = new NotificationFormDTO
                        {
                            Title = $"Mission validée : {mission.Name}",
                            Message = $"Votre mission a été validée par {toWhomName}. Elle est maintenant prête pour le paiement.",
                            Type = "mission_validated",
                            RelatedTable = "mission",
                            RelatedMenu = "collaborateur",
                            RelatedId = mission.MissionId,
                            Priority = 2,
                            UserIds = recipientUserIds.ToList(),
                            CreatedAt = DateTime.UtcNow
                        };
                        await _notificationsService.CreateAsync(notification, transaction);
                    }
                }
                // Capturer l'état après la validation
                var updatedMissionValidation = await _repository.GetByIdAsync(validation.MissionValidationId);
                if (updatedMissionValidation == null)
                {
                    throw new InvalidOperationException($"Validation de mission introuvable après mise à jour: {validation.MissionValidationId}");
                }
                if (!string.IsNullOrWhiteSpace(updatedMissionValidation.ToWhom))
                {
                    var toWhomUser = await _userService.GetByIdAsync(updatedMissionValidation.ToWhom);
                    toWhomName = toWhomUser?.Name ?? "Utilisateur inconnu";
                }
                var newMissionValidation = new
                {
                    Statut = (string?)updatedMissionValidation.Status,
                    DateValidation = updatedMissionValidation.ValidationDate,
                    Type = (string?)updatedMissionValidation.Type,
                    NomValideur = toWhomName
                };
                // Log de la validation avec éléments essentiels
                await _logService.LogAsync("VALIDATION", "MISSION_VALIDATION", oldMissionValidation, newMissionValidation, validation.UserId, "Statut,DateValidation,Type,NomValideur");
                await transaction.CommitAsync();
                _logger.LogInformation("Fin de validation réussie pour MissionValidationId: {MissionValidationId}", validation.MissionValidationId);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la validation de mission missionValidationId={MissionValidationId}, missionAssignationId={MissionAssignationId}",
                    validation.MissionValidationId, validation.MissionValidationId);
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
                // Récupérer le nom de l'utilisateur pour ToWhom
                var toWhomName = "Utilisateur inconnu";
                if (!string.IsNullOrWhiteSpace(missionValidation.ToWhom))
                {
                    var toWhomUser = await _userService.GetByIdAsync(missionValidation.ToWhom);
                    toWhomName = toWhomUser?.Name ?? "Utilisateur inconnu";
                }
                // Capturer les données pour le log avec éléments essentiels (ToWhomName au lieu de ToWhom)
                var logNewData = new
                {
                    IdMission = (string?)missionValidation.MissionId,
                    IdAssignationMission = (string?)missionValidation.MissionAssignationId,
                    Statut = (string?)missionValidation.Status,
                    Type = (string?)missionValidation.Type,
                    NomValideur = toWhomName
                };
                // Log de création avec éléments essentiels
                await _logService.LogAsync("INSERTION", "MISSION_VALIDATION", null, logNewData, userId, "IdMission,IdAssignationMission,Statut,Type,NomValideur");
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
            await using var transaction = await _repository.BeginTransactionAsync();
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
                // Récupérer le nom de l'utilisateur pour ToWhom ancien
                var oldToWhomName = "Utilisateur inconnu";
                if (!string.IsNullOrWhiteSpace(existingMissionValidation.ToWhom))
                {
                    var oldToWhomUser = await _userService.GetByIdAsync(existingMissionValidation.ToWhom);
                    oldToWhomName = oldToWhomUser?.Name ?? "Utilisateur inconnu";
                }
                // Capturer l'état avant la mise à jour
                var oldMissionValidation = new
                {
                    IdMission = (string?)existingMissionValidation.MissionId,
                    IdAssignationMission = (string?)existingMissionValidation.MissionAssignationId,
                    Statut = (string?)existingMissionValidation.Status,
                    Type = (string?)existingMissionValidation.Type,
                    NomValideur = oldToWhomName
                };
                var newMissionValidation = new MissionValidation(missionValidationDto)
                {
                    MissionValidationId = id
                };
                await _repository.UpdateAsync(newMissionValidation);
                await _repository.SaveChangesAsync();
                // Récupérer le nom de l'utilisateur pour ToWhom nouveau
                var updatedMissionValidation = await _repository.GetByIdAsync(id);
                if (updatedMissionValidation == null)
                {
                    throw new InvalidOperationException($"Validation de mission introuvable après mise à jour: {id}");
                }
                var newToWhomName = "Utilisateur inconnu";
                if (!string.IsNullOrWhiteSpace(updatedMissionValidation.ToWhom))
                {
                    var newToWhomUser = await _userService.GetByIdAsync(updatedMissionValidation.ToWhom);
                    newToWhomName = newToWhomUser?.Name ?? "Utilisateur inconnu";
                }
                // Capturer l'état après la mise à jour
                var logNewData = new
                {
                    IdMission = (string?)updatedMissionValidation.MissionId,
                    IdAssignationMission = (string?)updatedMissionValidation.MissionAssignationId,
                    Statut = (string?)updatedMissionValidation.Status,
                    Type = (string?)updatedMissionValidation.Type,
                    NomValideur = newToWhomName
                };
                // Log de mise à jour avec éléments essentiels
                await _logService.LogAsync("MODIFICATION", "MISSION_VALIDATION", oldMissionValidation, logNewData, userId, "IdMission,IdAssignationMission,Statut,Type,NomValideur");
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la validation de mission {MissionValidationId}", id);
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<bool> DeleteAsync(string id, string userId)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
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
                // Récupérer le nom de l'utilisateur pour ToWhom
                var toWhomName = "Utilisateur inconnu";
                if (!string.IsNullOrWhiteSpace(existingMissionValidation.ToWhom))
                {
                    var toWhomUser = await _userService.GetByIdAsync(existingMissionValidation.ToWhom);
                    toWhomName = toWhomUser?.Name ?? "Utilisateur inconnu";
                }
                // Capturer l'état avant la suppression
                var oldMissionValidation = new
                {
                    IdMission = (string?)existingMissionValidation.MissionId,
                    IdAssignationMission = (string?)existingMissionValidation.MissionAssignationId,
                    Statut = (string?)existingMissionValidation.Status,
                    Type = (string?)existingMissionValidation.Type,
                    NomValideur = toWhomName
                };
                await _repository.DeleteAsync(existingMissionValidation);
                await _repository.SaveChangesAsync();
                // Log de suppression avec éléments essentiels
                await _logService.LogAsync("SUPPRESSION", "MISSION_VALIDATION", oldMissionValidation, null, userId, "IdMission,IdAssignationMission,Statut,Type,NomValideur");
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la validation de mission {MissionValidationId}", id);
                await transaction.RollbackAsync();
                throw;
            }
        }
        public async Task<bool> UpdateStatusAsync(string id, string status, string userId)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                var existingMissionValidation = await _repository.GetByIdAsync(id);
                if (existingMissionValidation == null)
                {
                    _logger.LogWarning("Validation de mission avec l'ID {MissionValidationId} n'existe pas", id);
                    return false;
                }
                var toWhomName = "Utilisateur inconnu";
                if (!string.IsNullOrWhiteSpace(existingMissionValidation.ToWhom))
                {
                    var toWhomUser = await _userService.GetByIdAsync(existingMissionValidation.ToWhom);
                    toWhomName = toWhomUser?.Name ?? "Utilisateur inconnu";
                }
                // Capturer l'état avant la mise à jour du statut
                var oldMissionValidation = new
                {
                    Statut = (string?)existingMissionValidation.Status,
                    DateValidation = existingMissionValidation.ValidationDate,
                    Type = (string?)existingMissionValidation.Type,
                    NomValideur = toWhomName
                };
                var result = await _repository.UpdateStatusAsync(id, status);
                if (result)
                {
                    var updatedMissionValidation = await _repository.GetByIdAsync(id);
                    if (updatedMissionValidation == null)
                    {
                        throw new InvalidOperationException($"Validation de mission introuvable après mise à jour du statut: {id}");
                    }
                    if (!string.IsNullOrWhiteSpace(updatedMissionValidation.ToWhom))
                    {
                        var toWhomUser = await _userService.GetByIdAsync(updatedMissionValidation.ToWhom);
                        toWhomName = toWhomUser?.Name ?? "Utilisateur inconnu";
                    }
                    // Capturer l'état après la mise à jour du statut
                    var newMissionValidation = new
                    {
                        Statut = (string?)updatedMissionValidation.Status,
                        DateValidation = updatedMissionValidation.ValidationDate,
                        Type = (string?)updatedMissionValidation.Type,
                        NomValideur = toWhomName
                    };
                    // Log de mise à jour du statut avec éléments essentiels
                    await _logService.LogAsync("MODIFICATION_STATUS", "MISSION_VALIDATION", oldMissionValidation, newMissionValidation, userId, "Statut,DateValidation,Type,NomValideur");
                }
                await transaction.CommitAsync();
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du statut de la validation de mission {MissionValidationId}", id);
                await transaction.RollbackAsync();
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
       
        public async Task<int> GetPendingMissionsCountAsync()
        {
            try
            {
                _logger.LogInformation("Récupération du nombre total de missions en attente de validation");
                return await _repository.GetPendingMissionsCountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du nombre de missions en attente de validation");
                throw;
            }
        }
        public async Task<(double Rate, DateTime Date)> GetValidationRateAsync()
        {
            try
            {
                _logger.LogInformation("Récupération du taux de validation");
                return await _repository.GetValidationRateAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du taux de validation");
                throw;
            }
        }
    }
}