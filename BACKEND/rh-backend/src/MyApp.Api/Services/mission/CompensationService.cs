using MyApp.Api.Entities.mission;
using MyApp.Api.enums;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface ICompensationService
    {
        Task<IEnumerable<Compensation>> GetAllAsync();
        Task<AssignationWithCompensationsDto> GetByEmployeeIdAsync(string employeeId, string missionId);
        Task<string> CreateAsync(CompensationDTO compensation);
        Task<bool> UpdateStatusAsync(string employeeId, string missionId, string status);
        Task<(IEnumerable<AssignationWithCompensationsDto>, int)> GetCompensationsByStatusAsync(string? status, int page = 1, int pageSize = 10);
        Task<decimal> GetTotalPaidAmountAsync();
        Task<decimal> GetTotalNotPaidAmountAsync();
    }

    public class CompensationService : ICompensationService
    {
        private readonly ICompensationRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<CompensationService> _logger;
        private readonly IMissionRepository _missionService;

        public CompensationService(
            ICompensationRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<CompensationService> logger,
            IMissionRepository missionService
        )
        {
            _missionService = missionService ?? throw new ArgumentNullException(nameof(missionService));
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<Compensation>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les compensations");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les compensations");
                throw;
            }
        }

        public async Task<AssignationWithCompensationsDto> GetByEmployeeIdAsync(string employeeId, string missionId)
        {
            try
            {
                var mission = await _missionService.GetByIdAsync(employeeId, missionId);

                var compensations = await _repository.GetByMissionIdAsync(mission!.MissionId);
                return new AssignationWithCompensationsDto { Mission = mission, Compensations = compensations };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des compensations pour l'employé {EmployeeId} et mission {MissionId}", employeeId, missionId);
                throw;
            }
        }

        public async Task<(IEnumerable<AssignationWithCompensationsDto>, int)> GetCompensationsByStatusAsync(string? status, int page = 1, int pageSize = 10)
        {
            try
            {
                var effectiveStatus = string.IsNullOrWhiteSpace(status) ? null : status;
                var (mission, totalCount) = await _missionService.GetWithCompensationByStatusAsync(effectiveStatus, page, pageSize);

                var dtos = new List<AssignationWithCompensationsDto>();
                foreach (var ma in mission)
                {
                    var compensations = await _repository.GetByMissionIdAsync(ma.MissionId);
                    dtos.Add(new AssignationWithCompensationsDto { Mission = ma, Compensations = compensations });
                }

                return (dtos, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des compensations par status {Status}", status ?? "null");
                throw;
            }
        }

        public async Task<string> CreateAsync(CompensationDTO compensation)
        {
            try
            {
                if (compensation == null)
                    throw new ArgumentNullException(nameof(compensation), "Les données de la compensation ne peuvent pas être nulles");

                if (string.IsNullOrWhiteSpace(compensation.MissionId))
                    throw new ArgumentException("L'missionId ne peut pas être vide.", nameof(compensation.MissionId));

                if (string.IsNullOrWhiteSpace(compensation.EmployeeId))
                    throw new ArgumentException("L'EmployeeId ne peut pas être vide.", nameof(compensation.EmployeeId));
                var compensationId = _sequenceGenerator.GenerateSequence("seq_compensation_id", "COMP", 6, "-");

                var entity = new Compensation(compensation) { CompensationId = compensationId };

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Compensation créée avec succès pour l'ID: {CompensationId}", compensationId);
                return compensationId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la compensation");
                throw;
            }
        }

        public async Task<bool> UpdateStatusAsync(string employeeId, string missionId, string status)
        {
            try
            {
                // Utiliser AsNoTracking pour éviter le tracking automatique
                var entities = await _repository.GetByEmployeeAndMissionIdAsync(employeeId, missionId);

                if (entities == null || !entities.Any())
                {
                    return false;
                }

                var mission = await _missionService.GetByIdAsync(missionId);
                if (mission == null)
                {
                    _logger.LogWarning("Mission assignation not found for missionId: {missionId}", missionId);
                    return false;
                }

                foreach (var entity in entities)
                {
                    entity.Status = status;
                    entity.UpdatedAt = DateTime.UtcNow;
                    
                    // Ne pas passer les entités liées
                    entity.Employee = null;
                    entity.Mission = null;
                    
                    await _repository.UpdateAsync(entity);
                }

                if (status == "paid")
                {
                    mission.Status = MissionStatus.Planned;
                    await _missionService.UpdateAsync(mission);
                }

                await _repository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du statut de la compensation {employeeId} {missionId}", employeeId, missionId);
                throw;
            }
        }

        // Implémentation pour le total des montants payés
        public async Task<decimal> GetTotalPaidAmountAsync()
        {
            try
            {
                return await _repository.GetTotalPaidAmountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du total des montants payés");
                throw;
            }
        }

         public async Task<decimal> GetTotalNotPaidAmountAsync()
        {
            try
            {
                return await _repository.GetTotalNotPaidAmountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du total des montants payés");
                throw;
            }
        }
    }
}