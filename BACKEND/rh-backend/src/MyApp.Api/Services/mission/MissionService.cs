using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.dto.notifications;
using MyApp.Api.Models.dto.prevision;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Models.list.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.employee;
using MyApp.Api.Services.logs;
using MyApp.Api.Services.notifications;
using MyApp.Api.Services.prevision;
using MyApp.Api.Services.users;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IMissionService
    {
        Task<Mission?> VerifyMissionByNameAsync(string name);
        Task<(IEnumerable<Mission>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Mission>> GetAllAsync();
        Task<Mission?> GetByIdAsync(string id);
        Task<string> CreateAsync(MissionDTOForm mission);
        Task<bool> UpdateAsync(string id, MissionDTOForm mission);
        Task<bool> DeleteAsync(string id, string userId);
        Task<MissionStats> GetStatisticsAsync(string[]? matricule = null);
        Task<bool> CancelAsync(string id, string userId);
    }

    public class MissionService : IMissionService
    {
        private readonly IMissionRepository _repository;
        private readonly IMissionValidationService _validationService;
        private readonly IUserService _userService;
        private readonly IEmployeeService _employeeService;
        private readonly ICompensationScaleService _compensationScaleService;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly IMissionAssignationService _missionAssignationService;
        private readonly INotificationsService _notificationsService;
        private readonly ILogger<MissionService> _logger;
        private readonly ILogService _logService;
        private readonly ILieuService _lieuService;
        private readonly IPrevisionPriceService _previsionPriceService;

        public MissionService(
            IMissionRepository repository,
            ISequenceGenerator sequenceGenerator,
            IMissionAssignationService missionAssignationService,
            ILogger<MissionService> logger,
            IMissionValidationService validationService,
            IUserService userService,
            IEmployeeService employeeService,
            ICompensationScaleService compensationScaleService,
            INotificationsService notificationsService,
            ILogService logService,
            ILieuService lieuService,
            IPrevisionPriceService previsionPriceService
        )
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _missionAssignationService = missionAssignationService ?? throw new ArgumentNullException(nameof(missionAssignationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _validationService = validationService ?? throw new ArgumentNullException(nameof(validationService));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _employeeService = employeeService ?? throw new ArgumentNullException(nameof(employeeService));
            _compensationScaleService = compensationScaleService ?? throw new ArgumentNullException(nameof(compensationScaleService));
            _notificationsService = notificationsService ?? throw new ArgumentNullException(nameof(notificationsService));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
            _lieuService = lieuService ?? throw new ArgumentNullException(nameof(lieuService));
            _previsionPriceService = previsionPriceService ?? throw new ArgumentNullException(nameof(previsionPriceService));
        }

        /// <summary>
        /// Obtient le premier validateur disponible dans la hiérarchie
        /// </summary>
        private async Task<(UserDto? validator, string validatorType)> GetHierarchicalValidatorAsync(string? employeeCode)
        {
            if (string.IsNullOrWhiteSpace(employeeCode))
            {
                return (null, string.Empty);
            }

            // 1. Essayer GetDirecteurTutelleAsync
            var directeur = await _userService.GetDirecteurTutelleAsync(employeeCode);
            if (directeur != null)
            {
                return (directeur, "Directeur de tutelle");
            }

            // 2. Essayer GetResponsableSousDirecteurTutelleAsync
            var responsable = await _userService.GetResponsableSousDirecteurTutelleAsync(employeeCode);
            if (responsable != null)
            {
                return (responsable, "Responsable sous-directeur");
            }

            // 3. Essayer GetSuperiorAsync
            var superior = await _userService.GetSuperiorAsync(employeeCode);
            if (superior != null)
            {
                return (superior, "Supérieur hiérarchique");
            }

            return (null, string.Empty);
        }

        public async Task<Mission?> VerifyMissionByNameAsync(string name)
        {
            try
            {
                _logger.LogInformation("Vérification de l'existence de la mission avec le nom: {Name}", name);
                var filters = new MissionSearchFiltersDTO
                {
                    Name = name
                };
                var (result, _) = await _repository.SearchAsync(filters, 1, 1);
                var mission = result.FirstOrDefault();
                return mission;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification de la mission avec le nom: {Name}", name);
                throw;
            }
        }

        public async Task<(IEnumerable<Mission>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                _logger.LogInformation("Recherche des missions avec filtres, page={Page}, pageSize={PageSize}", page, pageSize);
                return await _repository.SearchAsync(filters, page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche des missions");
                throw;
            }
        }

        public async Task<IEnumerable<Mission>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les missions");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les missions");
                throw;
            }
        }

        public async Task<Mission?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'une mission avec un ID null ou vide");
                    return null;
                }

                _logger.LogInformation("Récupération de la mission avec l'ID: {MissionId}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la mission {MissionId}", id);
                throw;
            }
        }

        public async Task<string> CreateAsync(MissionDTOForm? missionDto)
        {
            try
            {
                if (missionDto == null)
                    throw new ArgumentNullException(nameof(missionDto), "Les données de la mission ne peuvent pas être nulles");

                await using var transaction = await _repository.BeginTransactionAsync();
                try
                {
                    var missionId = _sequenceGenerator.GenerateSequence("seq_mission_id", "MIS", 6, "-");
                    var mission = new Mission(missionDto) { MissionId = missionId };

                    await _repository.AddAsync(mission);
                    await _repository.SaveChangesAsync();

                    if (missionDto.Assignations.Count > 0)
                    {
                        var recipientUserIds = new HashSet<string> { missionDto.UserId }; 
                        var totalPayments = new List<decimal>(); 

                        foreach (var assignationDto in missionDto.Assignations)
                        {
                            var missionAssignation = new MissionAssignation(missionId, assignationDto);
                            var assignation = await _missionAssignationService.CreateAsync(missionAssignation);

                            var employee = await _employeeService.GetByIdAsync(missionAssignation.EmployeeId)
                                        ?? throw new InvalidOperationException($"Employé avec ID {missionAssignation.EmployeeId} introuvable.");
                            missionAssignation.Employee = employee;

                            var missionPaiement = new MissionPaiement();
                            var (totalAmount, dateDebut) = await missionPaiement.GenerateTotalPaiementAsync(missionAssignation, _compensationScaleService);
                            totalPayments.Add(totalAmount);

                            var previsionPriceDtoForm = new PrevisionPriceDtoForm()
                            {
                                Amount = totalAmount,
                                DepartureDate = dateDebut
                            };
                            await _previsionPriceService.AddAsync(previsionPriceDtoForm);

                            // Obtenir le validateur hiérarchique
                            var (hierarchicalValidator, validatorType) = await GetHierarchicalValidatorAsync(employee.EmployeeCode);
                            
                            // Obtenir le DRH
                            var drh = await _userService.GetDrhAsync();

                            _logger.LogInformation("Mission creator est {UserId}", missionDto.UserId);

                            // Créer la validation hiérarchique si un validateur existe
                            if (hierarchicalValidator != null && !string.IsNullOrWhiteSpace(hierarchicalValidator.UserId))
                            {
                                var missionValidationDtoForm = new MissionValidationDTOForm
                                {
                                    MissionId = missionId,
                                    MissionAssignationId = assignation.assignationId,
                                    MissionCreator = missionDto.UserId,
                                    Status = "pending",
                                    ToWhom = hierarchicalValidator.UserId,
                                    Type = validatorType
                                };
                                await _validationService.CreateAsync(missionValidationDtoForm, missionDto.UserId);
                                
                                recipientUserIds.Add(hierarchicalValidator.UserId);
                            }

                            // Créer la validation DRH uniquement si le DRH est différent du validateur hiérarchique
                            if (drh != null && !string.IsNullOrWhiteSpace(drh.UserId) && 
                                (hierarchicalValidator == null || drh.UserId != hierarchicalValidator.UserId))
                            {
                                var missionValidationDtoForm = new MissionValidationDTOForm
                                {
                                    MissionId = missionId,
                                    MissionAssignationId = assignation.assignationId,
                                    MissionCreator = missionDto.UserId,
                                    Status = null,
                                    ToWhom = drh.UserId,
                                    Type = "DRH"
                                };
                                await _validationService.CreateAsync(missionValidationDtoForm, missionDto.UserId);
                                
                                recipientUserIds.Add(drh.UserId);
                            }
                        }
                        
                        var lieu = await _lieuService.GetByIdAsync(mission.LieuId);
                        var lieuNom = lieu?.Nom ?? "lieu inconnu";
                        var grandTotal = totalPayments.Sum();

                        var notification = new NotificationFormDTO
                        {
                            Title = "Nouvelle mission créée",
                            Message = $"La mission '{mission.Name}' a été créée pour le lieu {lieuNom} du {mission.StartDate:yyyy-MM-dd} au {mission.EndDate:yyyy-MM-dd}. Montant total estimé: {grandTotal:C}.",
                            Type = "mission",
                            RelatedTable = "mission",
                            RelatedMenu = "collaborateur",
                            RelatedId = missionId,
                            Priority = 2,
                            UserIds = recipientUserIds.ToList(),
                            CreatedAt = DateTime.UtcNow
                        };

                        await _notificationsService.CreateAsync(notification, transaction);

                        var logNewData = new
                        {
                            Nom = mission.Name,
                            Description = mission.Description,
                            DateDebut = mission.StartDate,
                            DateFin = mission.EndDate,
                            NomLieu = lieuNom,
                            MontantTotal = grandTotal
                        };

                        await _logService.LogAsync("INSERTION", "MISSION", null, logNewData, missionDto.UserId, "Nom,Description,DateDebut,DateFin,NomLieu,MontantTotal");
                    }

                    await transaction.CommitAsync();
                    return missionId;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la mission");
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id, MissionDTOForm? mission)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                if (mission == null)
                    throw new ArgumentNullException(nameof(mission), "Les données de la mission ne peuvent pas être nulles");

                if (string.IsNullOrWhiteSpace(id))
                    throw new ArgumentException("L'ID de la mission ne peut pas être vide.", nameof(id));

                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Mission avec l'ID {MissionId} introuvable.", id);
                    return false;
                }

                // Store the old entity for logging
                var oldEntity = new Mission
                {
                    MissionId = entity.MissionId,
                    MissionType = entity.MissionType,
                    Name = entity.Name,
                    Description = entity.Description,
                    StartDate = entity.StartDate,
                    EndDate = entity.EndDate,
                    LieuId = entity.LieuId,
                    Status = entity.Status,
                    CreatedAt = entity.CreatedAt,
                    UpdatedAt = entity.UpdatedAt
                };

                // Update mission fields
                entity.MissionType = mission.MissionType;
                entity.Name = mission.Name;
                entity.Description = mission.Description ?? entity.Description;
                entity.StartDate = mission.StartDate;
                entity.EndDate = mission.EndDate;
                entity.LieuId = mission.LieuId;
                entity.Status = mission.Status ?? entity.Status;
                entity.UpdatedAt = DateTime.UtcNow;

                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();

                // Récupérer toutes les assignations actuelles pour synchronisation
                var currentAssignations = await _missionAssignationService.GetAllByMissionIdAsync(id);
                var dtoEmployeeIds = mission.Assignations?.Select(a => a.EmployeeId).ToHashSet() ?? new HashSet<string>();
                var recipientUserIds = new HashSet<string> { mission.UserId };

                // 1. Updater/Créer les assignations du DTO
                if (mission.Assignations != null && mission.Assignations.Any())
                {
                    foreach (var assignationDto in mission.Assignations)
                    {
                        var existingAssignation = currentAssignations.FirstOrDefault(a => a.EmployeeId == assignationDto.EmployeeId);
                        string? newAssignationId = null;

                        MissionAssignation updatedOrNewAssignation;
                        if (existingAssignation != null)
                        {
                            // Update existante
                            updatedOrNewAssignation = new MissionAssignation
                            {
                                AssignationId = existingAssignation.AssignationId,
                                EmployeeId = assignationDto.EmployeeId,
                                MissionId = id,
                                TransportId = assignationDto.TransportId,
                                DepartureDate = assignationDto.DepartureDate,
                                DepartureTime = assignationDto.DepartureTime,
                                ReturnDate = assignationDto.ReturnDate,
                                ReturnTime = assignationDto.ReturnTime,
                                Type = assignationDto.Type,
                                Duration = await _missionAssignationService.CalculateDuration(
                                    assignationDto.DepartureDate, assignationDto.ReturnDate),
                                UpdatedAt = DateTime.UtcNow
                            };

                            var updateResult = await _missionAssignationService.UpdateAsync(existingAssignation.AssignationId, updatedOrNewAssignation);
                            if (!updateResult)
                            {
                                _logger.LogWarning("Échec de la mise à jour de l'assignation pour EmployeeId={EmployeeId}, MissionId={MissionId}",
                                    assignationDto.EmployeeId, id);
                                await transaction.RollbackAsync();
                                return false;
                            }
                        }
                        else
                        {
                            // Créer nouvelle assignation
                            updatedOrNewAssignation = new MissionAssignation
                            {
                                AssignationId = Guid.NewGuid().ToString(),
                                EmployeeId = assignationDto.EmployeeId,
                                MissionId = id,
                                TransportId = assignationDto.TransportId,
                                DepartureDate = assignationDto.DepartureDate,
                                DepartureTime = assignationDto.DepartureTime,
                                ReturnDate = assignationDto.ReturnDate,
                                ReturnTime = assignationDto.ReturnTime,
                                Type = assignationDto.Type,
                                Duration = await _missionAssignationService.CalculateDuration(
                                    assignationDto.DepartureDate, assignationDto.ReturnDate),
                                CreatedAt = DateTime.UtcNow,
                                UpdatedAt = DateTime.UtcNow
                            };

                            var createResult = await _missionAssignationService.CreateAsync(updatedOrNewAssignation);
                            if (string.IsNullOrEmpty(createResult.assignationId))
                            {
                                _logger.LogWarning("Échec de la création de l'assignation pour EmployeeId={EmployeeId}, MissionId={MissionId}",
                                    assignationDto.EmployeeId, id);
                                await transaction.RollbackAsync();
                                return false;
                            }
                            newAssignationId = createResult.assignationId;
                        }

                        // Récupérer l'employé pour les validations
                        var employee = await _employeeService.GetByIdAsync(assignationDto.EmployeeId)
                            ?? throw new InvalidOperationException($"Employé avec ID {assignationDto.EmployeeId} introuvable.");

                        // Créer les validations seulement pour les nouvelles assignations
                        if (newAssignationId != null)
                        {
                            // Obtenir le validateur hiérarchique
                            var (hierarchicalValidator, validatorType) = await GetHierarchicalValidatorAsync(employee.EmployeeCode);
                            
                            // Obtenir le DRH
                            var drh = await _userService.GetDrhAsync();

                            // Créer la validation hiérarchique si un validateur existe
                            if (hierarchicalValidator != null && !string.IsNullOrWhiteSpace(hierarchicalValidator.UserId))
                            {
                                var missionValidationDtoForm = new MissionValidationDTOForm
                                {
                                    MissionId = id,
                                    MissionAssignationId = newAssignationId,
                                    MissionCreator = mission.UserId,
                                    Status = "pending",
                                    ToWhom = hierarchicalValidator.UserId,
                                    Type = validatorType
                                };
                                await _validationService.CreateAsync(missionValidationDtoForm, mission.UserId);
                                
                                recipientUserIds.Add(hierarchicalValidator.UserId);
                            }

                            // Créer la validation DRH uniquement si le DRH est différent du validateur hiérarchique
                            if (drh != null && !string.IsNullOrWhiteSpace(drh.UserId) && 
                                (hierarchicalValidator == null || drh.UserId != hierarchicalValidator.UserId))
                            {
                                var missionValidationDtoForm = new MissionValidationDTOForm
                                {
                                    MissionId = id,
                                    MissionAssignationId = newAssignationId,
                                    MissionCreator = mission.UserId,
                                    Status = null,
                                    ToWhom = drh.UserId,
                                    Type = "DRH"
                                };
                                await _validationService.CreateAsync(missionValidationDtoForm, mission.UserId);
                                
                                recipientUserIds.Add(drh.UserId);
                            }
                        }
                    }
                }

                // 2. Supprimer les assignations actuelles non présentes dans le DTO
                var toDeleteEmployeeIds = currentAssignations.Where(a => !dtoEmployeeIds.Contains(a.EmployeeId)).Select(a => a.EmployeeId);
                foreach (var empIdToDelete in toDeleteEmployeeIds)
                {
                    var assignationToDelete = currentAssignations.First(a => a.EmployeeId == empIdToDelete);
                    var deleteResult = await _missionAssignationService.DeleteAsync(assignationToDelete.AssignationId);
                    if (!deleteResult)
                    {
                        _logger.LogWarning("Échec de la suppression de l'assignation pour EmployeeId={EmployeeId}, MissionId={MissionId}",
                            empIdToDelete, id);
                        await transaction.RollbackAsync();
                        return false;
                    }
                }

                var oldLieu = await _lieuService.GetByIdAsync(oldEntity.LieuId);
                var oldLieuNom = oldLieu?.Nom ?? "lieu inconnu";

                var newLieu = await _lieuService.GetByIdAsync(entity.LieuId);
                var newLieuNom = newLieu?.Nom ?? "lieu inconnu";

                var notification = new NotificationFormDTO
                {
                    Title = "Mission mise à jour",
                    Message = $"La mission '{entity.Name}' a été mise à jour pour le lieu {newLieuNom} du {entity.StartDate:yyyy-MM-dd} au {entity.EndDate:yyyy-MM-dd}.",
                    Type = "mission",
                    RelatedTable = "mission",
                    RelatedMenu = "collaborateur",
                    RelatedId = id,
                    Priority = 2,
                    UserIds = recipientUserIds.ToList(),
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationsService.CreateAsync(notification, transaction);

                var logOldData = new
                {
                    Nom = oldEntity.Name,
                    Description = oldEntity.Description,
                    DateDebut = oldEntity.StartDate,
                    DateFin = oldEntity.EndDate,
                    NomLieu = oldLieuNom
                };

                var logNewData = new
                {
                    Nom = entity.Name,
                    Description = entity.Description,
                    DateDebut = entity.StartDate,
                    DateFin = entity.EndDate,
                    NomLieu = newLieuNom
                };

                await _logService.LogAsync("MODIFICATION", "MISSION", logOldData, logNewData, mission.UserId, "Nom,Description,DateDebut,DateFin,NomLieu");

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la mission {MissionId}", id);
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string id, string userId)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return false;

                await _repository.DeleteAsync(entity);
                await _repository.SaveChangesAsync();

                // Log de suppression
                await _logService.LogAsync("SUPPRESSION", entity, null, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la mission {MissionId}", id);
                throw;
            }
        }

        public async Task<bool> CancelAsync(string id, string userId)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    return false;
                }

                entity.Status = "canceled";
                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync(); 

                var validationCancelSuccess = await _validationService.CancelValidationsByMissionIdAsync(id, userId);

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'annulation de la mission {MissionId}. Rollback de la transaction.", id);
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<MissionStats> GetStatisticsAsync(string[]? matricule = null)
        {
            try
            {
                _logger.LogInformation("Récupération des statistiques des missions avec matricule filter: {Matricule}", matricule != null ? string.Join(", ", matricule) : "none");
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