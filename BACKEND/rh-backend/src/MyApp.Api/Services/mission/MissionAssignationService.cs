using MyApp.Api.Entities.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;
using MyApp.Api.Models.search.mission;

namespace MyApp.Api.Services.mission
{
    public interface IMissionAssignationService
    {
        Task<IEnumerable<MissionAssignation>> GetAllAsync();
        Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId, string transportId);

        Task<(IEnumerable<MissionAssignation>, int)> SearchAsync(MissionAssignationSearchFiltersDTO filters, int page,
            int pageSize);

        Task<(string EmployeeId, string MissionId, string TransportId)> CreateAsync(
            MissionAssignation missionAssignation);

        Task<bool> UpdateAsync(MissionAssignation missionAssignation);
        Task<bool> DeleteAsync(string employeeId, string missionId, string transportId);
    }

    public class MissionAssignationService : IMissionAssignationService
    {
        private readonly IMissionAssignationRepository _repository;
        private readonly IMissionService _missionService;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<MissionAssignation> _logger;

        public MissionAssignationService(
            IMissionAssignationRepository repository,
            IMissionService missionService,
            ISequenceGenerator sequenceGenerator,
            ILogger<MissionAssignation> logger)
        {
            _repository = repository;
            _missionService = missionService;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<MissionAssignation>> GetAllAsync()
        {
            try
            {
                var missionAssignations = await _repository.GetAllAsync();
                return missionAssignations.Select(ma => new MissionAssignation
                {
                    EmployeeId = ma.EmployeeId,
                    MissionId = ma.MissionId,
                    TransportId = ma.TransportId,
                    DepartureDate = ma.DepartureDate,
                    DepartureTime = ma.DepartureTime,
                    ReturnDate = ma.ReturnDate,
                    ReturnTime = ma.ReturnTime,
                    Duration = ma.Duration,
                    CreatedAt = ma.CreatedAt,
                    UpdatedAt = ma.UpdatedAt,
                    Employee = ma.Employee,
                    Mission = ma.Mission,
                    Transport = ma.Transport
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all mission assignations");
                throw new Exception($"Error retrieving all mission assignations: {ex.Message}", ex);
            }
        }

        public async Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId, string transportId)
        {
            try
            {
                var missionAssignation = await _repository.GetByIdAsync(employeeId, missionId, transportId);
                if (missionAssignation == null) return null;

                return new MissionAssignation
                {
                    EmployeeId = missionAssignation.EmployeeId,
                    MissionId = missionAssignation.MissionId,
                    TransportId = missionAssignation.TransportId,
                    DepartureDate = missionAssignation.DepartureDate,
                    DepartureTime = missionAssignation.DepartureTime,
                    ReturnDate = missionAssignation.ReturnDate,
                    ReturnTime = missionAssignation.ReturnTime,
                    Duration = missionAssignation.Duration,
                    CreatedAt = missionAssignation.CreatedAt,
                    UpdatedAt = missionAssignation.UpdatedAt,
                    Employee = missionAssignation.Employee,
                    Mission = missionAssignation.Mission,
                    Transport = missionAssignation.Transport
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error retrieving mission assignation with EmployeeId: {EmployeeId}, MissionId: {MissionId}, TransportId: {TransportId}",
                    employeeId, missionId, transportId);
                throw new Exception($"Error retrieving mission assignation: {ex.Message}", ex);
            }
        }

        public async Task<(IEnumerable<MissionAssignation>, int)> SearchAsync(
            MissionAssignationSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                var (results, totalCount) = await _repository.SearchAsync(filters, page, pageSize);
                return (results.Select(ma => new MissionAssignation
                {
                    EmployeeId = ma.EmployeeId,
                    MissionId = ma.MissionId,
                    TransportId = ma.TransportId,
                    DepartureDate = ma.DepartureDate,
                    DepartureTime = ma.DepartureTime,
                    ReturnDate = ma.ReturnDate,
                    ReturnTime = ma.ReturnTime,
                    Duration = ma.Duration,
                    CreatedAt = ma.CreatedAt,
                    UpdatedAt = ma.UpdatedAt,
                    Employee = ma.Employee,
                    Mission = ma.Mission,
                    Transport = ma.Transport
                }), totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching mission assignations");
                throw new Exception($"Error searching mission assignations: {ex.Message}", ex);
            }
        }

        public async Task<(string EmployeeId, string MissionId, string TransportId)> CreateAsync(
            MissionAssignation missionAssignation)
        {
            try
            {
                missionAssignation.CreatedAt = DateTime.UtcNow;
                missionAssignation.UpdatedAt = DateTime.UtcNow;

                // Créer l'assignation
                await _repository.AddAsync(missionAssignation);
                await _repository.SaveChangesAsync();

                // Mettre à jour le statut de la mission en "Planifié"
                var mission = await _missionService.GetByIdAsync(missionAssignation.MissionId);
                if (mission != null)
                {
                    mission.Status = "Planifié";
                    mission.UpdatedAt = DateTime.UtcNow;

                    await _missionService.UpdateAsync(mission);
                    _logger.LogInformation(
                        "Statut de la mission {MissionId} changé en 'Planifié' suite à l'assignation",
                        mission.MissionId);
                }
                else
                {
                    _logger.LogWarning("Mission {MissionId} non trouvée pour mise à jour du statut",
                        missionAssignation.MissionId);
                }

                _logger.LogInformation(
                    "Mission assignation created with EmployeeId: {EmployeeId}, MissionId: {MissionId}, TransportId: {TransportId}",
                    missionAssignation.EmployeeId, missionAssignation.MissionId, missionAssignation.TransportId);

                return (missionAssignation.EmployeeId, missionAssignation.MissionId, missionAssignation.TransportId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating mission assignation");
                throw new Exception($"Error creating mission assignation: {ex.Message}", ex);
            }
        }

        public async Task<bool> UpdateAsync(MissionAssignation missionAssignation)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(missionAssignation.EmployeeId,
                    missionAssignation.MissionId, missionAssignation.TransportId);
                if (existing == null)
                {
                    _logger.LogWarning(
                        "Mission assignation not found for update with EmployeeId: {EmployeeId}, MissionId: {MissionId}, TransportId: {TransportId}",
                        missionAssignation.EmployeeId, missionAssignation.MissionId, missionAssignation.TransportId);
                    return false;
                }

                existing.DepartureDate = missionAssignation.DepartureDate;
                existing.DepartureTime = missionAssignation.DepartureTime;
                existing.ReturnDate = missionAssignation.ReturnDate;
                existing.ReturnTime = missionAssignation.ReturnTime;
                existing.Duration = missionAssignation.Duration;
                existing.UpdatedAt = DateTime.UtcNow;

                await _repository.UpdateAsync(existing);
                await _repository.SaveChangesAsync();
                _logger.LogInformation(
                    "Mission assignation updated with EmployeeId: {EmployeeId}, MissionId: {MissionId}, TransportId: {TransportId}",
                    existing.EmployeeId, existing.MissionId, existing.TransportId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error updating mission assignation with EmployeeId: {EmployeeId}, MissionId: {MissionId}, TransportId: {TransportId}",
                    missionAssignation.EmployeeId, missionAssignation.MissionId, missionAssignation.TransportId);
                throw new Exception($"Error updating mission assignation: {ex.Message}", ex);
            }
        }

        public async Task<bool> DeleteAsync(string employeeId, string missionId, string transportId)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(employeeId, missionId, transportId);
                if (existing == null)
                {
                    _logger.LogWarning(
                        "Mission assignation not found for deletion with EmployeeId: {EmployeeId}, MissionId: {MissionId}, TransportId: {TransportId}",
                        employeeId, missionId, transportId);
                    return false;
                }

                await _repository.DeleteAsync(existing);
                await _repository.SaveChangesAsync();
                _logger.LogInformation(
                    "Mission assignation deleted with EmployeeId: {EmployeeId}, MissionId: {MissionId}, TransportId: {TransportId}",
                    employeeId, missionId, transportId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Error deleting mission assignation with EmployeeId: {EmployeeId}, MissionId: {MissionId}, TransportId: {TransportId}",
                    employeeId, missionId, transportId);
                throw new Exception($"Error deleting mission assignation: {ex.Message}", ex);
            }
        }
    }
}