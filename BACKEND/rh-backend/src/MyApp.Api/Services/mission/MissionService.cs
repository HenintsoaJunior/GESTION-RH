using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.list.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.employee;
using MyApp.Api.Services.logs;
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
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly IMissionAssignationService _missionAssignationService;
        private readonly ILogger<MissionService> _logger;
        private readonly ILogService _logService; // Added ILogService

        public MissionService(
            IMissionRepository repository,
            ISequenceGenerator sequenceGenerator,
            IMissionAssignationService missionAssignationService,
            ILogger<MissionService> logger,
            IMissionValidationService validationService,
            IUserService userService,
            IEmployeeService employeeService,
            ILogService logService // injecté ici
        )
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _missionAssignationService = missionAssignationService ?? throw new ArgumentNullException(nameof(missionAssignationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _validationService = validationService ?? throw new ArgumentNullException(nameof(validationService));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _employeeService = employeeService ?? throw new ArgumentNullException(nameof(employeeService));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
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

                    // Création mission assignation + validations (inchangé)
                    if (missionDto.Assignations.Count > 0)
                    {
                        foreach (var missionAssignation in missionDto.Assignations.Select(assignationDto => new MissionAssignation(missionId, assignationDto)))
                        {
                            var assignation = await _missionAssignationService.CreateAsync(missionAssignation);

                            var drh = await _userService.GetDrhAsync();
                            var employee = await _employeeService.GetByIdAsync(missionAssignation.EmployeeId)
                                           ?? throw new InvalidOperationException($"Employé avec ID {assignation.EmployeeId} introuvable.");

                            var superior = await _userService.GetSuperiorAsync(employee.EmployeeCode);
                            _logger.LogInformation("Mission creator est balbalbal {UserId} ", missionDto.UserId);

                            var missionValidationDtoForm = new MissionValidationDTOForm
                            {
                                MissionId = missionId,
                                MissionAssignationId = assignation.assignationId,
                                MissionCreator = missionDto.UserId,
                                Status = "En attente",
                                ToWhom = superior?.UserId,
                                Type = "Directeur de tutelle"
                            };
                            await _validationService.CreateAsync(missionValidationDtoForm, missionDto.UserId);

                            missionValidationDtoForm.Status = null;
                            missionValidationDtoForm.ToWhom = drh?.UserId;
                            missionValidationDtoForm.Type = "DRH";
                            await _validationService.CreateAsync(missionValidationDtoForm, missionDto.UserId);
                        }
                    }
                    // Log de création
                    await _logService.LogAsync("CREATION MISSION", null, mission, missionDto.UserId, "Name,Description,StartDate,EndDate,LieuId");
                    
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
            await using var transaction = await _repository.BeginTransactionAsync(); // Declare transaction outside try block
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
                entity.Description = mission.Description;
                entity.StartDate = mission.StartDate;
                entity.EndDate = mission.EndDate;
                entity.LieuId = mission.LieuId;
                entity.UpdatedAt = DateTime.UtcNow;

                // Update the mission in the repository
                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();

                // Handle mission assignations if provided
                if (mission.Assignations != null && mission.Assignations.Any())
                {
                    foreach (var assignationDto in mission.Assignations)
                    {
                        // Retrieve the existing assignation by employeeId and missionId
                        var existingAssignation = await _missionAssignationService.GetByEmployeeIdMissionIdAsync(
                            assignationDto.EmployeeId, id);

                        if (existingAssignation == null)
                        {
                            _logger.LogWarning("Aucune assignation existante trouvée pour EmployeeId={EmployeeId}, MissionId={MissionId}. Aucune nouvelle assignation ne sera créée.",
                                assignationDto.EmployeeId, id);
                            continue; // Skip if no existing assignation is found
                        }

                        // Update existing assignation
                        var updatedAssignation = new MissionAssignation
                        {
                            AssignationId = existingAssignation.AssignationId,
                            EmployeeId = assignationDto.EmployeeId,
                            MissionId = id,
                            TransportId = assignationDto.TransportId,
                            DepartureDate = assignationDto.DepartureDate,
                            DepartureTime = assignationDto.DepartureTime,
                            ReturnDate = assignationDto.ReturnDate,
                            ReturnTime = assignationDto.ReturnTime,
                            Duration = await _missionAssignationService.CalculateDuration(
                                assignationDto.DepartureDate,
                                assignationDto.ReturnDate),
                            UpdatedAt = DateTime.UtcNow
                        };

                        // Call UpdateAsync in MissionAssignationService
                        var updateResult = await _missionAssignationService.UpdateAsync(
                            existingAssignation.AssignationId, updatedAssignation);

                        if (!updateResult)
                        {
                            _logger.LogWarning("Échec de la mise à jour de l'assignation pour EmployeeId={EmployeeId}, MissionId={MissionId}",
                                assignationDto.EmployeeId, id);
                            await transaction.RollbackAsync(); // Rollback transaction on failure
                            return false;
                        }

                        _logger.LogInformation("Assignation mise à jour avec succès pour AssignationId={AssignationId}",
                            existingAssignation.AssignationId);
                    }
                }

                // Log mission update
                await _logService.LogAsync("MODIFICATION MISSION", oldEntity, entity, mission.UserId,
                    "Name,Description,StartDate,EndDate,LieuId");

                // Commit the transaction
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la mission {MissionId}", id);
                await transaction.RollbackAsync(); // Rollback transaction on exception
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
                await _logService.LogAsync("SUPPRESSION MISSION", entity, null, userId);

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

                entity.Status = "Annulé";
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