using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IMissionReportAttachmentService
    {
        Task<List<string>> InsertAsync(List<MissionReportAttachmentDTO> dtos, string missionReportId);
        Task<bool> DeleteByMissionReportIdAsync(string missionReportId);
        Task<List<MissionReportAttachment>> GetByMissionReportIdAsync(string missionReportId);
        Task<bool> DeleteAsync(List<MissionReportAttachment> attachments);
    }
    
    public class MissionReportAttachmentService : IMissionReportAttachmentService
    {
        private readonly IMissionReportAttachmentRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogService _logService;
        private readonly ILogger<MissionReportAttachmentService> _logger;

        public MissionReportAttachmentService(
            IMissionReportAttachmentRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogService logService,
            ILogger<MissionReportAttachmentService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<List<string>> InsertAsync(List<MissionReportAttachmentDTO> dtos, string missionReportId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(missionReportId))
                    throw new ArgumentException("L'ID de missionReportId est requis", nameof(missionReportId));
                if (dtos == null || !dtos.Any())
                    throw new ArgumentException("Au moins un fichier doit être fourni", nameof(dtos));

                var insertedIds = new List<string>();

                foreach (var dto in dtos)
                {
                    if (dto.FileContent == null || dto.FileContent.Length == 0)
                        continue;

                    var entity = new MissionReportAttachment
                    {
                        AttachmentId = _sequenceGenerator.GenerateSequence("seq_mission_report_attachments", "MRA", 6, "-"),
                        MissionReportId = missionReportId,
                        FileName = dto.FileName,
                        FileContent = dto.FileContent,
                        FileSize = dto.FileSize,
                        FileType = dto.FileType,
                        UploadedAt = DateTime.Now
                    };

                    await _repository.AddAsync(entity);
                    insertedIds.Add(entity.AttachmentId);
                }

                await _repository.SaveChangesAsync();

                return insertedIds;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'insertion des pièces jointes pour missionReportId: {MissionReportId}", missionReportId);
                throw;
            }
        }

        public async Task<bool> DeleteByMissionReportIdAsync(string missionReportId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(missionReportId))
                    throw new ArgumentException("L'ID de missionReportId est requis", nameof(missionReportId));

                var existingAttachments = await _repository.GetByMissionReportIdAsync(missionReportId);
                if (!existingAttachments.Any())
                {
                    return true;
                }

                foreach (var attachment in existingAttachments)
                {
                   await _repository.DeleteAsync(attachment);
                }

                await _repository.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression des pièces jointes pour missionReportId: {MissionReportId}", missionReportId);
                throw;
            }
        }

        public async Task<List<MissionReportAttachment>> GetByMissionReportIdAsync(string missionReportId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(missionReportId))
                    throw new ArgumentException("L'ID de missionReportId est requis", nameof(missionReportId));

                _logger.LogInformation("Récupération des pièces jointes pour missionReportId: {MissionReportId}", missionReportId);
                var attachments = await _repository.GetByMissionReportIdAsync(missionReportId);
                return attachments.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des pièces jointes pour missionReportId: {MissionReportId}", missionReportId);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(List<MissionReportAttachment> attachments)
        {
            try
            {
                if (attachments == null || !attachments.Any())
                {
                    return true;
                }

                foreach (var attachment in attachments)
                {
                    await _repository.DeleteAsync(attachment);
                }

                await _repository.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression des pièces jointes");
                throw;
            }
        }
    }
}