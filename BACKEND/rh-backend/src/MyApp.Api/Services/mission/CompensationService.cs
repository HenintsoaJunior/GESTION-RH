using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;
using System.Linq;

namespace MyApp.Api.Services.mission
{
    public interface ICompensationService
    {
        Task<IEnumerable<Compensation>> GetAllAsync();
        Task<AssignationWithCompensationsDto> GetByEmployeeIdAsync(string employeeId, string missionId);
        Task<string> CreateAsync(ComposationDTO compensation);
        Task<bool> UpdateStatusAsync(string employeeId, string assignationId, string status);
        Task<IEnumerable<AssignationWithCompensationsDto>> GetCompensationsByStatusAsync(string? status);
        Task<decimal> GetTotalPaidAmountAsync(); // Méthode pour le total des montants payés
    }

    public class CompensationService : ICompensationService
    {
        private readonly ICompensationRepository _repository;
        private readonly IMissionAssignationRepository _missionAssignationRepository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<CompensationService> _logger;

        public CompensationService(
            ICompensationRepository repository,
            IMissionAssignationRepository missionAssignationRepository,
            ISequenceGenerator sequenceGenerator,
            ILogger<CompensationService> logger
        )
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _missionAssignationRepository = missionAssignationRepository ?? throw new ArgumentNullException(nameof(missionAssignationRepository));
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
                var missionAssignation = await _missionAssignationRepository.GetByIdAsync(employeeId, missionId);

                var compensations = await _repository.GetByAssignationIdAsync(missionAssignation!.AssignationId);
                return new AssignationWithCompensationsDto { Assignation = missionAssignation, Compensations = compensations };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des compensations pour l'employé {EmployeeId} et mission {MissionId}", employeeId, missionId);
                throw;
            }
        }

        public async Task<IEnumerable<AssignationWithCompensationsDto>> GetCompensationsByStatusAsync(string? status)
        {
            try
            {
                var missionAssignations = await _missionAssignationRepository.GetWithCompensationByStatusAsync(status);

                var dtos = new List<AssignationWithCompensationsDto>();
                foreach (var ma in missionAssignations)
                {
                    var compensations = await _repository.GetByAssignationIdAsync(ma.AssignationId);
                    dtos.Add(new AssignationWithCompensationsDto { Assignation = ma, Compensations = compensations });
                }

                return dtos;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des compensations par status {Status}", status ?? "null");
                throw;
            }
        }

        public async Task<string> CreateAsync(ComposationDTO compensation)
        {
            try
            {
                if (compensation == null)
                    throw new ArgumentNullException(nameof(compensation), "Les données de la compensation ne peuvent pas être nulles");

                if (string.IsNullOrWhiteSpace(compensation.AssignationId))
                    throw new ArgumentException("L'AssignationId ne peut pas être vide.", nameof(compensation.AssignationId));

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

        public async Task<bool> UpdateStatusAsync(string employeeId, string assignationId, string status)
        {
            try
            {
                var entities = await _repository.GetByEmployeeAndAssignationIdAsync(employeeId, assignationId);
                if (entities == null || !entities.Any())
                {
                    return false;
                }

                foreach (var entity in entities)
                {
                    entity.Status = status;
                    entity.UpdatedAt = DateTime.UtcNow;
                    await _repository.UpdateAsync(entity);
                }

                await _repository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du statut de la compensation {employeeId} {assignationId}", employeeId, assignationId);
                throw;
            }
        }

        // Implémentation pour le total des montants payés
        public async Task<decimal> GetTotalPaidAmountAsync()
        {
            try
            {
                _logger.LogInformation("Récupération du total des montants payés");
                return await _repository.GetTotalPaidAmountAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du total des montants payés");
                throw;
            }
        }
    }
}