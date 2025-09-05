using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.list.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.employee;
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
        Task<bool> DeleteAsync(string id);
        Task<MissionStats> GetStatisticsAsync(string[]? matricule = null);
        Task<bool> CancelAsync(string id);
    }

    public class MissionService : IMissionService
    {
        private readonly IMissionRepository _repository;
        private readonly IMissionValidationService _validationService;
        private readonly IUserService _userService;
        private readonly IEmployeeService _employeeService;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly IMissionAssignationService _missionAssignationService;
        private readonly ILogger<MissionService> _logger; // Updated to use MissionService

        public MissionService(
            IMissionRepository repository,
            ISequenceGenerator sequenceGenerator,
            IMissionAssignationService missionAssignationService,
            ILogger<MissionService> logger, IMissionValidationService validationService, IUserService userService, IEmployeeService employeeService)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _missionAssignationService = missionAssignationService ?? throw new ArgumentNullException(nameof(missionAssignationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _validationService = validationService;
            _userService = userService;
            _employeeService = employeeService;
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
                var (result, total) = await _repository.SearchAsync(filters, 1, 1);
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
                {
                    _logger.LogWarning("Tentative de création avec un MissionDTOForm null");
                    throw new ArgumentNullException(nameof(missionDto), "Les données de la mission ne peuvent pas être nulles");
                }

                await using var transaction = await _repository.BeginTransactionAsync();
                try
                {
                    var missionId = _sequenceGenerator.GenerateSequence("seq_mission_id", "MIS", 6, "-");
                    var mission = new Mission(missionDto) { MissionId = missionId };

                    // Création mission
                    await _repository.AddAsync(mission);
                    await _repository.SaveChangesAsync();

                    // Création mission assignation
                    if (missionDto.Assignations?.Count > 0)
                    {
                        foreach (var missionAssignation in missionDto.Assignations.Select(assignationDto => new MissionAssignation(missionId, assignationDto)))
                        {
                            var assignation = await _missionAssignationService.CreateAsync(missionAssignation);
                            
                            var drh = await _userService.GetDrhAsync();
                            var employee = await _employeeService.GetByIdAsync(missionAssignation.EmployeeId);
                            if (employee == null)
                            {
                                throw new InvalidOperationException($"Employé avec ID {assignation.EmployeeId} introuvable.");
                            }
                            var superior = await _userService.GetSuperiorAsync(employee.EmployeeCode);
                            
                            var missionValidationDtoForm = new MissionValidationDTOForm
                            {
                                MissionId = missionId,
                                MissionAssignationId = assignation.assignationId,
                                MissionCreator = missionDto.UserId,
                                Status = "En attente",
                                ToWhom = superior?.UserId
                            };
                            await _validationService.CreateAsync(missionValidationDtoForm, missionDto.UserId);
                            missionValidationDtoForm.Status = null;
                            missionValidationDtoForm.ToWhom = drh?.UserId;
                            await _validationService.CreateAsync(missionValidationDtoForm, missionDto.UserId);
                        }

                        _logger.LogInformation("Création de {Count} assignations pour la mission {MissionId}", missionDto.Assignations.Count, missionId);
                    }
                    await transaction.CommitAsync();
                    _logger.LogInformation("Mission créée avec l'ID: {MissionId}", missionId);
                    return missionId;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Erreur lors de la création de la mission, transaction annulée");
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
            try
            {
                if (mission == null)
                {
                    _logger.LogWarning("Tentative de mise à jour avec un MissionDTOForm null");
                    throw new ArgumentNullException(nameof(mission), "Les données de la mission ne peuvent pas être nulles");
                }

                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Mission avec l'ID {MissionId} n'existe pas", id);
                    return false;
                }

                entity.Name = mission.Name;
                entity.Description = mission.Description;
                entity.StartDate = mission.StartDate;
                entity.EndDate = mission.EndDate;
                entity.LieuId = mission.LieuId;

                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();
                _logger.LogInformation("Mission mise à jour avec succès avec l'ID: {MissionId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la mission {MissionId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de suppression avec un ID null ou vide");
                    throw new ArgumentException("L'ID de la mission ne peut pas être null ou vide", nameof(id));
                }

                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Mission avec l'ID {MissionId} n'existe pas", id);
                    return false;
                }

                await _repository.DeleteAsync(entity);
                await _repository.SaveChangesAsync();
                _logger.LogInformation("Mission supprimée avec succès avec l'ID: {MissionId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la mission {MissionId}", id);
                throw;
            }
        }

        public async Task<bool> CancelAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative d'annulation avec un ID null ou vide");
                    throw new ArgumentException("L'ID de la mission ne peut pas être null ou vide", nameof(id));
                }

                var entity = await _repository.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Mission avec l'ID {MissionId} n'existe pas", id);
                    return false;
                }

                entity.Status = "Annulé";
                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();
                _logger.LogInformation("Mission {MissionId} annulée", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'annulation de la mission {MissionId}", id);
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