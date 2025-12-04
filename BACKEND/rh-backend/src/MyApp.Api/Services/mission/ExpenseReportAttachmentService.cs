// Service: ExpenseReportAttachmentService.cs
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IExpenseReportAttachmentService
    {
        Task<List<string>> InsertAsync(List<ExpenseReportAttachmentDTO> dtos, string assignationId);
        Task<bool> DeleteByMissionIdAsync(string assignationId);
    }
    
    public class ExpenseReportAttachmentService : IExpenseReportAttachmentService
    {
        private readonly IExpenseReportAttachmentRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogService _logService;
        private readonly ILogger<ExpenseReportAttachmentService> _logger;

        public ExpenseReportAttachmentService(
            IExpenseReportAttachmentRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogService logService,
            ILogger<ExpenseReportAttachmentService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<List<string>> InsertAsync(List<ExpenseReportAttachmentDTO> dtos, string missionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(missionId))
                    throw new ArgumentException("L'ID d'assignation est requis", nameof(missionId));
                if (dtos == null || !dtos.Any())
                    throw new ArgumentException("Au moins un fichier doit être fourni", nameof(dtos));

                var insertedIds = new List<string>();

                foreach (var dto in dtos)
                {
                    if (dto.FileContent == null || dto.FileContent.Length == 0)
                        continue;

                    var entity = new ExpenseReportAttachment
                    {
                        AttachmentId = _sequenceGenerator.GenerateSequence("seq_expense_report_attachment", "ERA", 6, "-"),
                        MissionId = missionId,
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

                _logger.LogInformation("Pièces jointes insérées avec succès pour missionId: {missionId}. IDs: {InsertedIds}", missionId, string.Join(", ", insertedIds));

                return insertedIds;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'insertion des pièces jointes pour missionId: {missionId}", missionId);
                throw;
            }
        }

        public async Task<bool> DeleteByMissionIdAsync(string missionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(missionId))
                    throw new ArgumentException("L'ID d'assignation est requis", nameof(missionId));

                var existingAttachments = await _repository.GetByMissionIdAsync(missionId);
                if (!existingAttachments.Any())
                {
                    _logger.LogInformation("Aucune pièce jointe à SUPPRESSION pour missionId: {missionId}", missionId);
                    return true;
                }

                foreach (var attachment in existingAttachments)
                {
                    await _logService.LogAsync("SUPPRESSION", attachment, null, "SYSTEM"); // Assuming system user for delete
                    await _repository.DeleteAsync(attachment);
                }

                await _repository.SaveChangesAsync();

                _logger.LogInformation("Pièces jointes supprimées avec succès pour missionId: {missionId}", missionId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression des pièces jointes pour missionId: {missionId}", missionId);
                throw;
            }
        }
    }
}