using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IMissionReportService
    {
        Task<IEnumerable<MissionReport>> GetAllAsync();
        Task<MissionReport> GetByIdAsync(string id);
        Task<IEnumerable<MissionReport>> GetByAssignationIdAsync(string assignationId);
        Task<string> CreateAsync(MissionReportDTOForm dto);
        Task<bool> UpdateAsync(string id, MissionReportDTOForm dto);
        Task<bool> DeleteAsync(string id, string userId);
    }

    public class MissionReportService : IMissionReportService
    {
        private readonly IMissionReportRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogService _logService;
        private readonly ILogger<MissionReportService> _logger;

        public MissionReportService(
            IMissionReportRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogService logService,
            ILogger<MissionReportService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<MissionReport>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les rapports de mission");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les rapports de mission");
                throw;
            }
        }

        public async Task<MissionReport> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un rapport de mission avec un ID null ou vide");
                    throw new ArgumentException("L'ID du rapport de mission ne peut pas être null ou vide", nameof(id));
                }

                _logger.LogInformation("Récupération du rapport de mission avec l'ID: {MissionReportId}", id);
                var report = await _repository.GetByIdAsync(id);
                if (report != null) return report;
                _logger.LogWarning("Rapport de mission avec l'ID {MissionReportId} n'existe pas", id);
                throw new KeyNotFoundException($"Le rapport de mission avec l'ID {id} n'existe pas");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du rapport de mission {MissionReportId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<MissionReport>> GetByAssignationIdAsync(string assignationId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(assignationId))
                {
                    _logger.LogWarning("Tentative de récupération des rapports de mission avec un assignationId null ou vide");
                    throw new ArgumentException("L'ID d'assignation ne peut pas être null ou vide", nameof(assignationId));
                }

                _logger.LogInformation("Récupération des rapports de mission pour assignationId: {AssignationId}", assignationId);
                return await _repository.GetByAssignationIdAsync(assignationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des rapports de mission pour assignationId: {AssignationId}", assignationId);
                throw;
            }
        }

        public async Task<string> CreateAsync(MissionReportDTOForm? dto)
        {
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("Tentative de création avec un MissionReportDTOForm null");
                    throw new ArgumentNullException(nameof(dto), "Les données du rapport de mission ne peuvent pas être nulles");
                }

                var entity = new MissionReport(dto)
                {
                    MissionReportId = _sequenceGenerator.GenerateSequence("seq_mission_report", "MR", 6, "-")
                };

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Rapport de mission créé avec l'ID: {MissionReportId}", entity.MissionReportId);
                await _logService.LogAsync("INSERTION", null, entity, dto.UserId);

                return entity.MissionReportId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du rapport de mission");
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id, MissionReportDTOForm? dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour avec un ID null ou vide");
                    throw new ArgumentException("L'ID du rapport de mission ne peut pas être null ou vide", nameof(id));
                }

                if (dto == null)
                {
                    _logger.LogWarning("Tentative de mise à jour avec un MissionReportDTOForm null");
                    throw new ArgumentNullException(nameof(dto), "Les données du rapport de mission ne peuvent pas être nulles");
                }

                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Rapport de mission avec l'ID {MissionReportId} n'existe pas", id);
                    return false;
                }

                var old = new MissionReport
                {
                    MissionReportId = existing.MissionReportId,
                    // Copy other properties as needed
                };

                var updated = new MissionReport(dto)
                {
                    MissionReportId = existing.MissionReportId
                };

                await _repository.UpdateAsync(updated);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Rapport de mission mis à jour avec succès avec l'ID: {MissionReportId}", id);
                await _logService.LogAsync("MODIFICATION", old, updated, dto.UserId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du rapport de mission {MissionReportId}", id);
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
                    throw new ArgumentException("L'ID du rapport de mission ne peut pas être null ou vide", nameof(id));
                }

                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Rapport de mission avec l'ID {MissionReportId} n'existe pas", id);
                    return false;
                }

                await _repository.DeleteAsync(existing);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Rapport de mission supprimé avec succès avec l'ID: {MissionReportId}", id);
                await _logService.LogAsync("SUPPRESSION", existing, null, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du rapport de mission {MissionReportId}", id);
                throw;
            }
        }
    }
}