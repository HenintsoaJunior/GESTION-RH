using MyApp.Api.Entities.mission;
using MyApp.Api.enums;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.record;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.currency;
using MyApp.Api.Services.logs;
using MyApp.Api.Services.mission;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface IExpenseReportService
    {
        Task<(IEnumerable<ExpenseReport> Reports, decimal TotalAmount, IEnumerable<ExpenseReportAttachment> Attachments)> GetByMissionIdAsync(string missionId);
        Task<IEnumerable<ExpenseReport>> GetAllAsync();
        Task<ExpenseReport?> GetByIdAsync(string id);
        Task<List<string>> CreateAsync(ExpenseReportDTOForm dto);
        Task<bool> UpdateAsync(string id, ExpenseLineDTO dto);
        Task<bool> DeleteAsync(string id, string userId);
        Task<decimal> GetTotalReimbursedAmountAsync();
        Task<decimal> GetTotalNotReimbursedAmountAsync();
        Task<int> GetTotalReimbursedCountAsync();
        Task<int> GetTotalNotReimbursedCountAsync();
        Task<decimal> GetTotalAmountByMissionIdAsync(string missionId);
        Task<bool> ReimburseByMissionIdAsync(string missionId, string userId);
        Task<IEnumerable<string>> GetStatusByMissionIdAsync(string missionId);
        Task<(IEnumerable<ExpenseSummary>, int TotalCount)> GetByFilterAsync(ExpenseReportFilterDto filterDto, int page, int pageSize);
    }

    public class ExpenseReportService : IExpenseReportService
    {
        private readonly IExpenseReportRepository _repository;
        private readonly IExpenseReportAttachmentRepository _attachmentRepository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ICurrencyService _currencyService;
        private readonly ILogService _logService;
        private readonly IMissionService _missionService;
        private readonly ILogger<ExpenseReportService> _logger;

        public ExpenseReportService(
            IExpenseReportRepository repository,
            IExpenseReportAttachmentRepository attachmentRepository,
            ISequenceGenerator sequenceGenerator,
            ICurrencyService currencyService,
            ILogService logService,
            IMissionService missionService,
            ILogger<ExpenseReportService> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _attachmentRepository = attachmentRepository ?? throw new ArgumentNullException(nameof(attachmentRepository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _currencyService = currencyService ?? throw new ArgumentNullException(nameof(currencyService));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
            _missionService = missionService ?? throw new ArgumentNullException(nameof(missionService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // Récupère tous les rapports + montant total + pièces jointes pour une mission
        public async Task<(IEnumerable<ExpenseReport> Reports, decimal TotalAmount, IEnumerable<ExpenseReportAttachment> Attachments)> GetByMissionIdAsync(string missionId)
        {
            if (string.IsNullOrWhiteSpace(missionId))
                throw new ArgumentException("L'ID de mission est requis", nameof(missionId));

            var reports = await _repository.GetByMissionIdAsync(missionId);
            var totalAmount = reports.Sum(r => r.Amount);
            var attachments = await _attachmentRepository.GetByMissionIdAsync(missionId);

            return (reports, totalAmount, attachments);
        }

        public async Task<IEnumerable<ExpenseReport>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<ExpenseReport?> GetByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentException("L'ID est requis", nameof(id));

            return await _repository.GetByIdAsync(id);
        }

        // Méthode principale : upsert complet des rapports de frais pour une mission
        public async Task<List<string>> CreateAsync(ExpenseReportDTOForm dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));
            if (string.IsNullOrWhiteSpace(dto.UserId)) throw new ArgumentException("UserId requis", nameof(dto.UserId));
            if (string.IsNullOrWhiteSpace(dto.MissionId)) throw new ArgumentException("MissionId requis", nameof(dto.MissionId));
            if (dto.ExpenseLinesByType == null || !dto.ExpenseLinesByType.Any())
                throw new ArgumentException("Au moins une ligne de frais requise", nameof(dto.ExpenseLinesByType));

            var affectedIds = new List<string>();
            var entitiesToAdd = new List<ExpenseReport>();
            var entitiesToUpdate = new List<ExpenseReport>();
            var entitiesToDelete = new List<ExpenseReport>();

            // 1. Récupérer les rapports existants pour cette mission
            var existingReports = await _repository.GetByMissionIdAsync(dto.MissionId);
            var existingIds = existingReports.Select(r => r.ExpenseReportId).ToHashSet();

            // 2. Identifier les rapports soumis (pour mise à jour)
            var submittedIds = new HashSet<string>();
            foreach (var lines in dto.ExpenseLinesByType.Values.Where(v => v != null))
            {
                foreach (var line in lines!)
                {
                    if (!string.IsNullOrWhiteSpace(line.ExpenseReportId))
                        submittedIds.Add(line.ExpenseReportId);
                }
            }

            // 3. Supprimer ceux qui ne sont plus soumis
            foreach (var report in existingReports)
            {
                if (!submittedIds.Contains(report.ExpenseReportId))
                {
                    entitiesToDelete.Add(report);
                    affectedIds.Add(report.ExpenseReportId);
                }
            }

            // 4. Traiter chaque ligne soumise
            foreach (var kvp in dto.ExpenseLinesByType)
            {
                var typeId = kvp.Key;
                var lines = kvp.Value ?? new List<ExpenseLineDTO>();

                foreach (var lineDto in lines)
                {
                    if (lineDto == null || string.IsNullOrWhiteSpace(lineDto.Titled)) continue;

                    var report = new ExpenseReport(lineDto)
                    {
                        MissionId = dto.MissionId,
                        ExpenseReportTypeId = typeId,
                        Status = "notreimbursed"
                    };

                    // Conversion devise si nécessaire
                    if (report.AmountMGA == 0 && report.Amount > 0)
                    {
                        var converted = await _currencyService.ConvertToMGAAsync(report.Amount, report.CurrencyUnit);
                        report.AmountMGA = converted.ConvertedAmount;
                    }

                    if (!string.IsNullOrWhiteSpace(lineDto.ExpenseReportId) && existingIds.Contains(lineDto.ExpenseReportId))
                    {
                        // Mise à jour
                        report.ExpenseReportId = lineDto.ExpenseReportId;
                        entitiesToUpdate.Add(report);
                        affectedIds.Add(report.ExpenseReportId);
                    }
                    else
                    {
                        // Création
                        report.ExpenseReportId = _sequenceGenerator.GenerateSequence("seq_expense_report", "ER", 6, "-");
                        entitiesToAdd.Add(report);
                        affectedIds.Add(report.ExpenseReportId);
                    }
                }
            }

            // 5. Appliquer les suppressions
            foreach (var report in entitiesToDelete)
                await _repository.DeleteAsync(report);

            // 6. Ajouter les nouveaux
            foreach (var report in entitiesToAdd)
                await _repository.AddAsync(report);

            // 7. Mettre à jour les existants
            foreach (var report in entitiesToUpdate)
                await _repository.UpdateAsync(report);

            // 8. Gérer les pièces jointes (uniquement ajout, jamais suppression)
            if (dto.Attachments != null && dto.Attachments.Any())
            {
                var existingAttachments = await _attachmentRepository.GetByMissionIdAsync(dto.MissionId);
                var existingKeys = existingAttachments
                    .Select(a => $"{a.FileName}|{a.FileSize}")
                    .ToHashSet();

                var newAttachments = dto.Attachments
                    .Where(a => !existingKeys.Contains($"{a.FileName}|{a.FileSize}"))
                    .ToList();

                if (newAttachments.Any())
                {
                    var attachmentIds = await InsertAttachmentsAsync(newAttachments, dto.MissionId);
                    affectedIds.AddRange(attachmentIds);
                }
            }

            await _repository.SaveChangesAsync();
            await _attachmentRepository.SaveChangesAsync();

            return affectedIds.Distinct().ToList();
        }

        private async Task<List<string>> InsertAttachmentsAsync(List<ExpenseReportAttachmentDTO> dtos, string missionId)
        {
            var insertedIds = new List<string>();

            foreach (var dto in dtos)
            {
                if (dto.FileContent == null || dto.FileContent.Length == 0) continue;

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

                await _attachmentRepository.AddAsync(entity);
                insertedIds.Add(entity.AttachmentId);
            }

            await _attachmentRepository.SaveChangesAsync();
            return insertedIds;
        }

        public async Task<bool> UpdateAsync(string id, ExpenseLineDTO dto)
        {
            if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("ID requis", nameof(id));
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            var updated = new ExpenseReport(dto)
            {
                ExpenseReportId = id,
                MissionId = existing.MissionId,
                Status = "notreimbursed"
            };

            if (updated.AmountMGA == 0 && updated.Amount > 0)
            {
                var converted = await _currencyService.ConvertToMGAAsync(updated.Amount, updated.CurrencyUnit);
                updated.AmountMGA = converted.ConvertedAmount;
            }

            await _repository.UpdateAsync(updated);
            await _repository.SaveChangesAsync();
            await _logService.LogAsync("MODIFICATION", existing, updated, dto.UserId ?? "");

            return true;
        }

        public async Task<bool> DeleteAsync(string id, string userId)
        {
            if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("ID requis", nameof(id));

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            await _repository.DeleteAsync(existing);
            await _repository.SaveChangesAsync();
            await _logService.LogAsync("SUPPRESSION", existing, null, userId);

            return true;
        }

        public async Task<decimal> GetTotalReimbursedAmountAsync()
        {
            var reports = await _repository.GetAllAsync();
            return reports.Where(r => r.Status == "reimbursed").Sum(r => r.Amount);
        }

        public async Task<decimal> GetTotalNotReimbursedAmountAsync()
        {
            var reports = await _repository.GetNotReimbursedAsync();
            if (!reports.Any()) return 0m;

            var missions = reports.Select(r => r.Mission).Where(m => m != null).Distinct()!;

            decimal total = 0m;
            foreach (var mission in missions)
            {
                bool isNationalAndNoteFrais = mission!.MissionType == MissionType.National && 
                                            mission.Type == PaymentType.NoteFrais;
                
                if (isNationalAndNoteFrais)
                {
                    var reportsForMission = reports.Where(r => r.MissionId == mission.MissionId);
                    total += reportsForMission.Sum(r => r.Amount);
                }
                else
                {
                    var spent = reports.Where(r => r.MissionId == mission.MissionId).Sum(r => r.Amount);
                    var allocated = await _missionService.GetTotalCompensationsAsync(mission.EmployeeId!, mission.MissionId);
                    total += Math.Max(0m, allocated - spent);
                }
            }
            return total;
        }

        public async Task<int> GetTotalReimbursedCountAsync()
        {
            var reports = await _repository.GetAllAsync();
            return reports.Count(r => r.Status == "reimbursed");
        }

        public async Task<int> GetTotalNotReimbursedCountAsync()
        {
            var reports = await _repository.GetAllAsync();
            return reports.Count(r => r.Status == "notreimbursed");
        }

        public async Task<decimal> GetTotalAmountByMissionIdAsync(string missionId)
        {
            if (string.IsNullOrWhiteSpace(missionId)) throw new ArgumentException("MissionId requis", nameof(missionId));
            var reports = await _repository.GetByMissionIdAsync(missionId);
            return reports.Sum(r => r.Amount);
        }

        public async Task<bool> ReimburseByMissionIdAsync(string missionId, string userId)
        {
            if (string.IsNullOrWhiteSpace(missionId)) throw new ArgumentException("MissionId requis", nameof(missionId));
            if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("UserId requis", nameof(userId));

            var reports = await _repository.GetByMissionIdAsync(missionId);
            var toReimburse = reports.Where(r => r.Status != "reimbursed").ToList();

            if (!toReimburse.Any()) return false;

            foreach (var report in toReimburse)
            {
                report.Status = "reimbursed";
                report.ExpenseReportType = null;
                await _repository.UpdateAsync(report);
            }

            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<string>> GetStatusByMissionIdAsync(string missionId)
        {
            if (string.IsNullOrWhiteSpace(missionId)) throw new ArgumentException("MissionId requis", nameof(missionId));
            var reports = await _repository.GetByMissionIdAsync(missionId);
            return reports.Select(r => r.Status).Where(s => s != null).Distinct()!;
        }

        public async Task<(IEnumerable<ExpenseSummary>, int TotalCount)> GetByFilterAsync(ExpenseReportFilterDto filterDto, int page, int pageSize)
        {
            var (summaries, totalCount) = await _repository.GetByFilterAsync(filterDto, page, pageSize);

            var result = new List<ExpenseSummary>();
            foreach (var s in summaries)
            {
                decimal finalAmount;
                
                var missionInfo = await _missionService.GetByIdAsync(s.MissionId);
                
                if (missionInfo != null)
                {
                    bool isNationalAndNoteFrais = missionInfo.MissionType == MissionType.National && 
                                                missionInfo.Type == PaymentType.NoteFrais;
                    if (isNationalAndNoteFrais)
                    {
                        finalAmount = s.TotalAmount;
                    }
                    else
                    {
                        var allocated = await _missionService.GetTotalCompensationsAsync(s.EmployeeId, s.MissionId);
                        var remaining = Math.Max(0m, allocated - s.TotalAmount);
                        finalAmount = remaining;
                    }
                }
                else
                {
                    var allocated = await _missionService.GetTotalCompensationsAsync(s.EmployeeId, s.MissionId);
                    var remaining = Math.Max(0m, allocated - s.TotalAmount);
                    finalAmount = remaining;
                }

                result.Add(new ExpenseSummary(
                    s.MissionId,
                    s.MissionTitled,
                    s.Status,
                    s.EmployeeName,
                    s.EmployeeId,
                    s.EmployeeCode,
                    s.LieuName,
                    s.CreatedAt,
                    finalAmount
                ));
            }

            return (result, totalCount);
        }
    }
}