using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IExpenseReportService
    {
        Task<(IEnumerable<ExpenseReport> Reports, decimal TotalAmount, IEnumerable<ExpenseReportAttachment> Attachments)> GetByAssignationIdAsync(string assignationId);
        Task<IEnumerable<ExpenseReport>> GetAllAsync();
        Task<ExpenseReport> GetByIdAsync(string id);
        Task<List<string>> CreateAsync(ExpenseReportDTOForm dto);
        Task<bool> UpdateAsync(string id, ExpenseLineDTO dto);
        Task<bool> DeleteAsync(string id, string userId);
        Task<decimal> GetTotalReimbursedAmountAsync();
        Task<decimal> GetTotalNotReimbursedAmountAsync();
        Task<int> GetTotalReimbursedCountAsync();
        Task<int> GetTotalNotReimbursedCountAsync();
        Task<decimal> GetTotalAmountByAssignationIdAsync(string assignationId);
        Task<(IEnumerable<MissionAssignation> Items, int TotalCount)> GetDistinctMissionAssignationsAsync(string? status, int page, int pageSize);
        Task<bool> ReimburseByAssignationIdAsync(string assignationId, string userId);
        Task<IEnumerable<string>> GetStatusByAssignationIdAsync(string assignationId);
    }

    public class ExpenseReportService : IExpenseReportService
    {
        private readonly IExpenseReportRepository _repository;
        private readonly IExpenseReportAttachmentRepository _attachmentRepository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogService _logService;
        private readonly ILogger<ExpenseReportService> _logger;

        public ExpenseReportService(
            IExpenseReportRepository repository,
            IExpenseReportAttachmentRepository attachmentRepository,
            ISequenceGenerator sequenceGenerator,
            ILogService logService,
            ILogger<ExpenseReportService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _attachmentRepository = attachmentRepository ?? throw new ArgumentNullException(nameof(attachmentRepository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }


        public async Task<IEnumerable<string>> GetStatusByAssignationIdAsync(string assignationId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(assignationId))
                {
                    _logger.LogWarning("Tentative de récupération du statut des rapports de frais avec un assignationId null ou vide");
                    throw new ArgumentException("L'ID d'assignation ne peut pas être null ou vide", nameof(assignationId));
                }

                var reports = await _repository.GetByAssignationIdAsync(assignationId);
                var statuses = reports.Select(r => r.Status).Where(s => s != null).Cast<string>().Distinct();

                if (!statuses.Any())
                {
                    return Enumerable.Empty<string>();
                }

                return statuses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du statut des rapports de frais pour assignationId: {AssignationId}", assignationId);
                throw;
            }
        }
        public async Task<bool> ReimburseByAssignationIdAsync(string assignationId, string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(assignationId))
                {
                    throw new ArgumentException("L'ID d'assignation ne peut pas être null ou vide", nameof(assignationId));
                }

                if (string.IsNullOrWhiteSpace(userId))
                {
                    throw new ArgumentException("L'ID utilisateur ne peut pas être null ou vide", nameof(userId));
                }

                var reports = await _repository.GetByAssignationIdAsync(assignationId);
                var expenseReports = reports as ExpenseReport[] ?? reports.ToArray();

                if (!expenseReports.Any())
                {
                    return false;
                }

                foreach (var report in expenseReports)
                {
                    if (report.Status != "reimbursed")
                    {
                        var originalReport = new ExpenseReport
                        {
                            ExpenseReportId = report.ExpenseReportId,
                            Titled = report.Titled,
                            Description = report.Description,
                            Type = report.Type,
                            Status = report.Status,
                            CurrencyUnit = report.CurrencyUnit,
                            Amount = report.Amount,
                            Rate = report.Rate,
                            AssignationId = report.AssignationId,
                            ExpenseReportTypeId = report.ExpenseReportTypeId
                        };
                        report.Status = "reimbursed";
                        await _repository.UpdateAsync(report);
                        // await _logService.LogAsync("REIMBURSEMENT", originalReport, report, userId);
                    }
                }

                await _repository.SaveChangesAsync();

                _logger.LogInformation("Remboursement terminé pour assignationId: {AssignationId}", assignationId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du remboursement des rapports pour assignationId: {AssignationId}", assignationId);
                throw;
            }
        }
        public async Task<decimal> GetTotalReimbursedAmountAsync()
        {
            try
            {
                var reports = await _repository.GetAllAsync();

                var totalReimbursed = reports.AsQueryable()
                    .Where(er => er.Status == "reimbursed")
                    .Sum(er => er.Amount);

                return totalReimbursed;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du total des montants remboursés");
                throw;
            }
        }

        public async Task<decimal> GetTotalAmountByAssignationIdAsync(string assignationId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(assignationId))
                {
                    throw new ArgumentException("L'AssignationId est requis et ne peut pas être vide.", nameof(assignationId));
                }

                var reports = await _repository.GetAllAsync();

                var totalAmount = reports.AsQueryable()
                    .Where(er => er.AssignationId == assignationId)
                    .Sum(er => er.Amount);

                return totalAmount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du montant total pour l'AssignationId: {AssignationId}", assignationId);
                throw;
            }
        }

        public async Task<decimal> GetTotalNotReimbursedAmountAsync()
        {
            try
            {
                var reports = await _repository.GetAllAsync();

                var totalNotReimbursed = reports.AsQueryable()
                    .Where(er => er.Status == "pending")
                    .Sum(er => er.Amount);

                return totalNotReimbursed;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du total des montants remboursés");
                throw;
            }
        }

        public async Task<int> GetTotalReimbursedCountAsync()
        {
            try
            {
                var reports = await _repository.GetAllAsync();

                var totalReimbursedCount = reports.AsQueryable()
                    .Where(er => er.Status == "reimbursed")
                    .GroupBy(er => er.AssignationId)
                    .Count();

                return totalReimbursedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du nombre total de rapports remboursés par assignation");
                throw;
            }
        }

        public async Task<int> GetTotalNotReimbursedCountAsync()
        {
            try
            {
                var reports = await _repository.GetAllAsync();

                var totalNotReimbursedCount = reports.AsQueryable()
                    .Where(er => er.Status == "pending")
                    .GroupBy(er => er.AssignationId)
                    .Count();

                return totalNotReimbursedCount;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du nombre total de rapports non remboursés par assignation");
                throw;
            }
        }

        public async Task<(IEnumerable<ExpenseReport> Reports, decimal TotalAmount, IEnumerable<ExpenseReportAttachment> Attachments)> GetByAssignationIdAsync(string assignationId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(assignationId))
                {
                    _logger.LogWarning("Tentative de récupération des rapports de frais avec un assignationId null ou vide");
                    throw new ArgumentException("L'ID d'assignation ne peut pas être null ou vide", nameof(assignationId));
                }

                _logger.LogInformation("Récupération des rapports de frais pour assignationId: {AssignationId}", assignationId);
                var reports = await _repository.GetByAssignationIdAsync(assignationId);
                var expenseReports = reports as ExpenseReport[] ?? reports.ToArray();
                var totalAmount = expenseReports.Sum(r => r.Amount);

                _logger.LogInformation("Récupération des pièces jointes pour assignationId: {AssignationId}", assignationId);
                var attachments = await _attachmentRepository.GetByAssignationIdAsync(assignationId);

                return (expenseReports, totalAmount, attachments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des rapports de frais et pièces jointes pour assignationId: {AssignationId}", assignationId);
                throw;
            }
        }

        public async Task<IEnumerable<ExpenseReport>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les rapports de frais");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les rapports de frais");
                throw;
            }
        }

        public async Task<ExpenseReport> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un rapport de frais avec un ID null ou vide");
                    throw new ArgumentException("L'ID du rapport de frais ne peut pas être null ou vide", nameof(id));
                }

                _logger.LogInformation("Récupération du rapport de frais avec l'ID: {ExpenseReportId}", id);
                var report = await _repository.GetByIdAsync(id);
                if (report != null) return report;
                _logger.LogWarning("Rapport de frais avec l'ID {ExpenseReportId} n'existe pas", id);
                throw new InvalidOperationException($"Le rapport de frais avec l'ID {id} n'existe pas");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du rapport de frais {ExpenseReportId}", id);
                throw;
            }
        }

        public async Task<List<string>> CreateAsync(ExpenseReportDTOForm dto)
        {
            try
            {
                if (dto == null)
                {
                    throw new ArgumentNullException(nameof(dto), "Les données du rapport de frais ne peuvent pas être nulles");
                }

                if (string.IsNullOrWhiteSpace(dto.UserId))
                    throw new ArgumentException("L'ID utilisateur est requis", nameof(dto.UserId));
                if (string.IsNullOrWhiteSpace(dto.AssignationId))
                    throw new ArgumentException("L'ID d'assignation est requis", nameof(dto.AssignationId));
                if (dto.ExpenseLinesByType == null || !dto.ExpenseLinesByType.Any())
                    throw new ArgumentException("Au moins une ligne de frais par type doit être fournie", nameof(dto.ExpenseLinesByType));

                var affectedIds = new List<string>();

                var entitiesToAdd = new List<ExpenseReport>();
                var entitiesToUpdate = new List<(ExpenseReport Existing, ExpenseReport Updated)>();
                var entitiesToDelete = new List<ExpenseReport>();

                // Fetch existing reports for the assignation
                var existingReports = await _repository.GetByAssignationIdAsync(dto.AssignationId);
                var existingIds = existingReports.Select(r => r.ExpenseReportId).ToHashSet();

                // Collect submitted IDs for updates
                var submittedIds = new HashSet<string>();
                foreach (var kvp in dto.ExpenseLinesByType)
                {
                    var lines = kvp.Value ?? new List<ExpenseLineDTO>();
                    foreach (var lineDto in lines)
                    {
                        if (!string.IsNullOrWhiteSpace(lineDto.ExpenseReportId))
                        {
                            submittedIds.Add(lineDto.ExpenseReportId);
                        }
                    }
                }

                // Identify records to delete: existing but not in submitted
                foreach (var existingReport in existingReports)
                {
                    if (!submittedIds.Contains(existingReport.ExpenseReportId))
                    {
                        entitiesToDelete.Add(existingReport);
                        affectedIds.Add(existingReport.ExpenseReportId);
                        _logger.LogInformation("Suppression du rapport de frais avec l'ID: {ExpenseReportId}", existingReport.ExpenseReportId);
                    }
                }

                // Process submitted lines for insert/update
                foreach (var kvp in dto.ExpenseLinesByType)
                {
                    var typeId = kvp.Key;
                    var lines = kvp.Value ?? new List<ExpenseLineDTO>();

                    foreach (var lineDto in lines)
                    {
                        if (lineDto == null || string.IsNullOrWhiteSpace(lineDto.Titled)) continue;

                        var entity = new ExpenseReport(lineDto)
                        {
                            AssignationId = dto.AssignationId,
                            ExpenseReportTypeId = typeId,
                        };

                        if (!string.IsNullOrWhiteSpace(lineDto.ExpenseReportId))
                        {
                            // Update logic
                            entity.ExpenseReportId = lineDto.ExpenseReportId;
                            var existing = await _repository.GetByIdAsync(entity.ExpenseReportId);
                            if (existing != null)
                            {
                                entitiesToUpdate.Add((existing, entity));
                                affectedIds.Add(entity.ExpenseReportId);
                                _logger.LogInformation("Mise à jour du rapport de frais avec l'ID: {ExpenseReportId}", entity.ExpenseReportId);
                            }
                            else
                            {
                                // If ID provided but not found, treat as new insert
                                _logger.LogWarning("Rapport de frais avec l'ID {ExpenseReportId} non trouvé, création d'un nouveau", entity.ExpenseReportId);
                                entity.ExpenseReportId = _sequenceGenerator.GenerateSequence("seq_expense_report", "ER", 6, "-");
                                if (entity.Amount <= 0)
                                    throw new ArgumentException($"Montant invalide pour la ligne de type {typeId}", nameof(lineDto.Amount));
                                entitiesToAdd.Add(entity);
                                affectedIds.Add(entity.ExpenseReportId);
                            }
                        }
                        else
                        {
                            // Insert logic
                            entity.ExpenseReportId = _sequenceGenerator.GenerateSequence("seq_expense_report", "ER", 6, "-");
                            if (entity.Amount <= 0)
                                throw new ArgumentException($"Montant invalide pour la ligne de type {typeId}", nameof(lineDto.Amount));
                            entitiesToAdd.Add(entity);
                            affectedIds.Add(entity.ExpenseReportId);
                        }
                    }
                }

                // Delete entities first
                foreach (var entityToDelete in entitiesToDelete)
                {
                    await _repository.DeleteAsync(entityToDelete);
                }

                // Add new entities
                foreach (var entity in entitiesToAdd)
                {
                    await _repository.AddAsync(entity);
                }

                // Update existing entities
                foreach (var (existing, updated) in entitiesToUpdate)
                {
                    await _repository.UpdateAsync(updated);
                }

                // Handle attachments intelligently
                if (dto.Attachments != null && dto.Attachments.Any())
                {
                    // Get existing attachments for this assignation
                    var existingAttachments = await _attachmentRepository.GetByAssignationIdAsync(dto.AssignationId);

                    var existingAttachmentKeys = existingAttachments
                        .Select(a => $"{a.FileName}|{a.FileSize}")
                        .ToHashSet();

                    // Filter out attachments that already exist
                    var newAttachments = dto.Attachments
                        .Where(a => !existingAttachmentKeys.Contains($"{a.FileName}|{a.FileSize}"))
                        .ToList();

                    if (newAttachments.Any())
                    {
                        // Insert only new attachments
                        var attachmentIds = await InsertAttachmentsAsync(newAttachments, dto.AssignationId);
                        affectedIds.AddRange(attachmentIds);
                    }
                    else
                    {
                        await DeleteAttachmentsByAssignationIdAsync(dto.AssignationId);
                    }
                }
                else
                {
                    await DeleteAttachmentsByAssignationIdAsync(dto.AssignationId);
                }

                await _repository.SaveChangesAsync();

                return affectedIds.Distinct().ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'upsert des rapports de frais");
                throw;
            }
        }


        private async Task<List<string>> InsertAttachmentsAsync(List<ExpenseReportAttachmentDTO> dtos, string assignationId)
        {
            var insertedIds = new List<string>();

            foreach (var dto in dtos)
            {
                if (dto.FileContent == null || dto.FileContent.Length == 0)
                    continue;

                var entity = new ExpenseReportAttachment
                {
                    AttachmentId = _sequenceGenerator.GenerateSequence("seq_expense_report_attachment", "ERA", 6, "-"),
                    AssignationId = assignationId,
                    FileName = dto.FileName,
                    FileContent = dto.FileContent,
                    FileSize = dto.FileSize,
                    FileType = dto.FileType,
                    UploadedAt = DateTime.Now
                };

                await _attachmentRepository.AddAsync(entity);
                insertedIds.Add(entity.AttachmentId);
            }

            await _attachmentRepository.SaveChangesAsync();

            _logger.LogInformation("Pièces jointes insérées avec succès pour assignationId: {AssignationId}. IDs: {InsertedIds}", assignationId, string.Join(", ", insertedIds));

            return insertedIds;
        }

        private async Task DeleteAttachmentsByAssignationIdAsync(string assignationId)
        {
            var existingAttachments = await _attachmentRepository.GetByAssignationIdAsync(assignationId);
            if (!existingAttachments.Any())
            {
                return;
            }

            foreach (var attachment in existingAttachments)
            {
                await _attachmentRepository.DeleteAsync(attachment);
            }

            await _attachmentRepository.SaveChangesAsync();

        }

        public async Task<bool> UpdateAsync(string id, ExpenseLineDTO dto)  // Corrigé : Utilise ExpenseLineDTO pour une ligne unique
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour avec un ID null ou vide");
                    throw new ArgumentException("L'ID du rapport de frais ne peut pas être null ou vide", nameof(id));
                }

                if (dto == null)
                {
                    _logger.LogWarning("Tentative de mise à jour avec un ExpenseLineDTO null");
                    throw new ArgumentNullException(nameof(dto), "Les données de la ligne de frais ne peuvent pas être nulles");
                }

                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Rapport de frais avec l'ID {ExpenseReportId} n'existe pas", id);
                    return false;
                }

                var updated = new ExpenseReport(dto)  // Utilise le constructeur pour mapper depuis ExpenseLineDTO
                {
                    ExpenseReportId = existing.ExpenseReportId,  // Conserve l'ID existant
                };

                await _repository.UpdateAsync(updated);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Rapport de frais mis à jour avec succès avec l'ID: {ExpenseReportId}", id);
                await _logService.LogAsync("MODIFICATION", existing, updated, dto.UserId ?? "");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du rapport de frais {ExpenseReportId}", id);
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
                    throw new ArgumentException("L'ID du rapport de frais ne peut pas être null ou vide", nameof(id));
                }

                var existing = await _repository.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Rapport de frais avec l'ID {ExpenseReportId} n'existe pas", id);
                    return false;
                }

                await _repository.DeleteAsync(existing);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Rapport de frais supprimé avec succès avec l'ID: {ExpenseReportId}", id);
                await _logService.LogAsync("SUPPRESSION", existing, null, userId);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du rapport de frais {ExpenseReportId}", id);
                throw;
            }
        }
        
        public async Task<(IEnumerable<MissionAssignation> Items, int TotalCount)> GetDistinctMissionAssignationsAsync(string? status, int pageNumber, int pageSize)
        {
            try
            {
                
                var (items, totalCount) = await _repository.GetDistinctMissionAssignationsAsync(status, pageNumber, pageSize);
                
                return (items ?? Enumerable.Empty<MissionAssignation>(), totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des assignations de mission distinctes");
                throw;
            }
        }
    }
    
}