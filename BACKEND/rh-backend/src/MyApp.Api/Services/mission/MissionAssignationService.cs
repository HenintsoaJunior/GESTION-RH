using MyApp.Api.Entities.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;
using MyApp.Api.Models.search.mission;
using MyApp.Api.Services.employee;
using ClosedXML.Excel;
using MyApp.Api.Entities.employee;
using MyApp.Api.Services.employe;

namespace MyApp.Api.Services.mission
{
    public interface IMissionAssignationService
    {
        Task<IEnumerable<Employee>> GetEmployeesNotAssignedToMissionAsync(string missionId);
        Task<IEnumerable<MissionAssignation>> GetAllAsync();
        Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId, string? transportId);
        Task<MissionAssignation?> GetByEmployeeIdMissionIdAsync(string employeeId, string missionId);
        Task<(IEnumerable<MissionAssignation>, int)> SearchAsync(MissionAssignationSearchFiltersDTO filters, int page, int pageSize);
        Task<(string EmployeeId, string MissionId, string? TransportId)> CreateAsync(MissionAssignation missionAssignation);
        Task<bool> UpdateAsync(MissionAssignation missionAssignation);
        Task<bool> DeleteAsync(string employeeId, string missionId, string transportId);
        Task<MissionPaiementResult> GeneratePaiementsAsync(string? employeeId = null, string? missionId = null, string? directionId = null, DateTime? startDate = null, DateTime? endDate = null);
        Task<byte[]> GenerateExcelReportAsync(string? employeeId = null, string? missionId = null, string? directionId = null, DateTime? startDate = null, DateTime? endDate = null);
    }

    public class MissionAssignationService : IMissionAssignationService
    {
        private readonly IMissionAssignationRepository _repository;
        private readonly IMissionService _missionService;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ICompensationScaleService _compensationScaleService;
        private readonly ICategoriesOfEmployeeService _categoriesOfEmployeeService;
        private readonly IEmployeeService _employeeService;
        private readonly ILogger<MissionAssignationService> _logger;
        private readonly ILoggerFactory _loggerFactory;

        public MissionAssignationService(
            IMissionAssignationRepository repository,
            IMissionService missionService,
            ISequenceGenerator sequenceGenerator,
            ICompensationScaleService compensationScaleService,
            ICategoriesOfEmployeeService categoriesOfEmployeeService,
            IEmployeeService employeeService,
            ILogger<MissionAssignationService> logger,
            ILoggerFactory loggerFactory)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _missionService = missionService ?? throw new ArgumentNullException(nameof(missionService));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _compensationScaleService = compensationScaleService ?? throw new ArgumentNullException(nameof(compensationScaleService));
            _categoriesOfEmployeeService = categoriesOfEmployeeService ?? throw new ArgumentNullException(nameof(categoriesOfEmployeeService));
            _employeeService = employeeService ?? throw new ArgumentNullException(nameof(employeeService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
        }

        public async Task<IEnumerable<Employee>> GetEmployeesNotAssignedToMissionAsync(string missionId)
        {
            try
            {
                await ValidateMissionExistsAsync(missionId);
                var allEmployees = await _employeeService.GetAllAsync();
                var assignedEmployeeIds = await _repository.GetAssignedEmployeeIdsAsync(missionId);
                return FilterNotAssignedEmployees(allEmployees, assignedEmployeeIds);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving employees not assigned to mission: {ex.Message}", ex);
            }
        }

        private async Task ValidateMissionExistsAsync(string missionId)
        {
            var mission = await _missionService.GetByIdAsync(missionId);
            if (mission == null)
            {
                throw new InvalidOperationException($"Mission with ID {missionId} not found.");
            }
        }

        private static IEnumerable<Employee> FilterNotAssignedEmployees(
            IEnumerable<Employee> allEmployees, 
            IEnumerable<string> assignedEmployeeIds)
        {
            return allEmployees.Where(e => !assignedEmployeeIds.Contains(e.EmployeeId));
        }

        public async Task<IEnumerable<MissionAssignation>> GetAllAsync()
        {
            try
            {
                var missionAssignations = await _repository.GetAllAsync();
                return missionAssignations.Select(CreateMissionAssignationFromEntity);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving all mission assignations: {ex.Message}", ex);
            }
        }

        public async Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId, string? transportId)
        {
            try
            {
                var missionAssignation = await _repository.GetByIdAsync(employeeId, missionId, transportId);
                return missionAssignation == null ? null : CreateMissionAssignationFromEntity(missionAssignation);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving mission assignation: {ex.Message}", ex);
            }
        }

        public async Task<MissionAssignation?> GetByEmployeeIdMissionIdAsync(string employeeId, string missionId)
        {
            try
            {
                var missionAssignation = await _repository.GetByIdAsync(employeeId, missionId);
                return missionAssignation == null ? null : CreateMissionAssignationFromEntity(missionAssignation);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving mission assignation: {ex.Message}", ex);
            }
        }

        private static MissionAssignation CreateMissionAssignationFromEntity(MissionAssignation entity)
        {
            return new MissionAssignation
            {
                EmployeeId = entity.EmployeeId,
                MissionId = entity.MissionId,
                TransportId = entity.TransportId,
                DepartureDate = entity.DepartureDate,
                DepartureTime = entity.DepartureTime,
                ReturnDate = entity.ReturnDate,
                ReturnTime = entity.ReturnTime,
                Duration = entity.Duration,
                CreatedAt = entity.CreatedAt,
                UpdatedAt = entity.UpdatedAt,
                Employee = entity.Employee,
                Mission = entity.Mission,
                Transport = entity.Transport
            };
        }

        public async Task<MissionPaiementResult> GeneratePaiementsAsync(string? employeeId = null, string? missionId = null, string? directionId = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                // Récupérer les affectations filtrées (ou toutes si aucun filtre)
                var missionAssignations = await _repository.GetFilteredAssignationsAsync(employeeId, missionId, directionId, startDate, endDate);
                
                // Vérifier si des affectations existent
                if (!missionAssignations.Any())
                {
                    _logger.LogWarning("Aucune affectation de mission trouvée pour les filtres fournis : employeeId={EmployeeId}, missionId={MissionId}, directionId={DirectionId}, startDate={StartDate}, endDate={EndDate}",
                        employeeId ?? "null", missionId ?? "null", directionId ?? "null", startDate?.ToString("yyyy-MM-dd") ?? "null", endDate?.ToString("yyyy-MM-dd") ?? "null");
                    return new MissionPaiementResult
                    {
                        DailyPaiements = new List<DailyPaiement>(),
                        MissionAssignation = null
                    };
                }

                var paiementResults = new List<MissionPaiementResult>();
                foreach (var missionAssignation in missionAssignations)
                {
                    // Générer les paiements pour chaque affectation
                    var paiementResult = await GeneratePaymentsForAssignation(missionAssignation);
                    paiementResults.Add(paiementResult);
                    LogPaymentGenerationResult(paiementResult, missionAssignation.EmployeeId, missionAssignation.MissionId);
                }

                // Combiner les résultats
                return CombinePaiementResults(paiementResults);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la génération des paiements pour employeeId={EmployeeId}, missionId={MissionId}, directionId={DirectionId}", 
                    employeeId ?? "null", missionId ?? "null", directionId ?? "null");
                throw new Exception($"Erreur lors de la génération des paiements : {ex.Message}", ex);
            }
        }

        private async Task<MissionAssignation> GetMissionAssignationAsync(string employeeId, string missionId)
        {
            var missionAssignation = await GetByEmployeeIdMissionIdAsync(employeeId, missionId);
            if (missionAssignation == null)
            {
                throw new InvalidOperationException($"Mission assignation not found for EmployeeId: {employeeId}, MissionId: {missionId}");
            }
            return missionAssignation;
        }

        private async Task<MissionPaiementResult> GeneratePaymentsForAssignation(MissionAssignation missionAssignation)
        {
            var missionPaiement = new MissionPaiement(_categoriesOfEmployeeService);
            return await missionPaiement.GeneratePaiement(missionAssignation, _compensationScaleService);
        }

        private void LogPaymentGenerationResult(MissionPaiementResult paiementResult, string employeeId, string missionId)
        {
            // Méthode conservée pour compatibilité mais sans logs
        }

        private MissionPaiementResult CombinePaiementResults(List<MissionPaiementResult> results)
        {
            if (results.Count == 1)
                return results[0];

            var combinedDailyPaiements = results.SelectMany(r => r.DailyPaiements).ToList();
            var firstAssignation = results.First().MissionAssignation;

            return new MissionPaiementResult
            {
                DailyPaiements = combinedDailyPaiements,
                MissionAssignation = firstAssignation // Note: This assumes a single assignation context; adjust if needed
            };
        }

        // NOUVELLE VERSION CORRIGÉE - Génération Excel sans problème de répétition
        public async Task<byte[]> GenerateExcelReportAsync(string? employeeId = null, string? missionId = null, string? directionId = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                // Récupérer directement les affectations filtrées
                var missionAssignations = await _repository.GetFilteredAssignationsAsync(employeeId, missionId, directionId, startDate, endDate);
                
                if (!missionAssignations.Any())
                {
                    _logger.LogWarning("Aucune affectation trouvée pour la génération du rapport Excel avec les filtres : employeeId={EmployeeId}, missionId={MissionId}, directionId={DirectionId}", 
                        employeeId ?? "null", missionId ?? "null", directionId ?? "null");
                    return CreateEmptyExcelReport();
                }

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Mission Payment Report");
                CreateExcelHeaders(worksheet);

                var currentRow = 2; // Commencer après les en-têtes
                
                foreach (var assignment in missionAssignations)
                {
                    try
                    {
                        var paiementResult = await GeneratePaymentsForAssignation(assignment);
                        var missionPayments = ConvertToLegacyFormat(paiementResult);
                        
                        foreach (var payment in missionPayments)
                        {
                            WritePaymentRowToWorksheet(worksheet, payment, assignment, currentRow);
                            currentRow++;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erreur lors du traitement de l'affectation EmployeeId={EmployeeId}, MissionId={MissionId}", 
                            assignment.EmployeeId, assignment.MissionId);
                        // Continuer avec les autres affectations
                        continue;
                    }
                }

                // Si aucune ligne n'a été ajoutée après les en-têtes
                if (currentRow == 2)
                {
                    worksheet.Cell(2, 1).Value = "Aucune donnée de paiement générée pour les affectations trouvées";
                    worksheet.Range("A2:K2").Merge();
                }

                worksheet.Columns().AdjustToContents();

                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la génération du rapport Excel");
                throw new Exception($"Error generating Excel report: {ex.Message}", ex);
            }
        }

        // Nouvelle méthode pour écrire une ligne de paiement avec la bonne affectation
        private static void WritePaymentRowToWorksheet(IXLWorksheet worksheet, MissionPaiement payment, MissionAssignation assignment, int row)
        {
            var employee = assignment.Employee;
            var mission = assignment.Mission;
            var compensationScales = payment.CompensationScales?.ToList() ?? new List<CompensationScale>();

            worksheet.Cell(row, 1).Value = $"{employee?.FirstName} {employee?.LastName}";
            worksheet.Cell(row, 2).Value = employee?.EmployeeCode ?? string.Empty;
            worksheet.Cell(row, 3).Value = mission?.Name ?? string.Empty;
            worksheet.Cell(row, 4).Value = mission?.Lieu != null ? $"{mission.Lieu.Nom}/{mission.Lieu.Pays}" : string.Empty;
            worksheet.Cell(row, 5).Value = FormatDate(mission?.StartDate);
            worksheet.Cell(row, 6).Value = FormatDate(payment.Date);
            worksheet.Cell(row, 7).Value = CalculateTransportAmount(compensationScales, assignment.TransportId);
            worksheet.Cell(row, 8).Value = CalculateExpenseAmount(compensationScales, "Petit Déjeuner");
            worksheet.Cell(row, 9).Value = CalculateExpenseAmount(compensationScales, "Déjeuner");
            worksheet.Cell(row, 10).Value = CalculateExpenseAmount(compensationScales, "Dinner");
            worksheet.Cell(row, 11).Value = CalculateExpenseAmount(compensationScales, "Hébergement");

            // Appliquer le format numérique aux colonnes de montants
            worksheet.Range($"G{row}:K{row}").Style.NumberFormat.Format = "#,##0";
        }

        // Méthode pour créer un rapport Excel vide
        private byte[] CreateEmptyExcelReport()
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Mission Payment Report");
            
            CreateExcelHeaders(worksheet);
            
            // Ajouter une ligne indiquant qu'aucune donnée n'a été trouvée
            worksheet.Cell(2, 1).Value = "Aucune affectation trouvée pour les critères spécifiés";
            worksheet.Range("A2:K2").Merge();
            worksheet.Cell(2, 1).Style.Font.Italic = true;
            worksheet.Cell(2, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            
            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private static IEnumerable<MissionPaiement> ConvertToLegacyFormat(MissionPaiementResult result)
        {
            if (result?.DailyPaiements == null || !result.DailyPaiements.Any())
                return new List<MissionPaiement>();

            return result.DailyPaiements.Select(daily => new MissionPaiement
            {
                Date = daily.Date,
                CompensationScales = daily.CompensationScales?.Select(scale => new CompensationScale
                {
                    CompensationScaleId = scale.CompensationScaleId,
                    Amount = scale.Amount,
                    TransportId = scale.TransportId,
                    ExpenseTypeId = scale.ExpenseTypeId,
                    EmployeeCategoryId = scale.EmployeeCategoryId,
                    Transport = scale.Transport != null ? new Transport
                    {
                        TransportId = scale.Transport.TransportId,
                        Type = scale.Transport.Type,
                        CreatedAt = scale.Transport.CreatedAt,
                        UpdatedAt = scale.Transport.UpdatedAt
                    } : null,
                    ExpenseType = scale.ExpenseType != null ? new ExpenseType
                    {
                        ExpenseTypeId = scale.ExpenseType.ExpenseTypeId,
                        TimeStart = scale.ExpenseType.TimeStart,
                        TimeEnd = scale.ExpenseType.TimeEnd,
                        Type = scale.ExpenseType.Type,
                        CreatedAt = scale.ExpenseType.CreatedAt,
                        UpdatedAt = scale.ExpenseType.UpdatedAt
                    } : null,
                    EmployeeCategory = scale.EmployeeCategory != null ? new EmployeeCategory
                    {
                        EmployeeCategoryId = scale.EmployeeCategory.EmployeeCategoryId,
                        Code = scale.EmployeeCategory.Code,
                        Label = scale.EmployeeCategory.Label,
                        CreatedAt = scale.EmployeeCategory.CreatedAt,
                        UpdatedAt = scale.EmployeeCategory.UpdatedAt
                    } : null,
                    CreatedAt = scale.CreatedAt,
                    UpdatedAt = scale.UpdatedAt
                }).ToList(),
                TotalAmount = daily.TotalAmount,
                MissionAssignation = result.MissionAssignation != null ? new MissionAssignation
                {
                    EmployeeId = result.MissionAssignation.EmployeeId,
                    MissionId = result.MissionAssignation.MissionId,
                    TransportId = result.MissionAssignation.TransportId,
                    DepartureDate = result.MissionAssignation.DepartureDate,
                    DepartureTime = result.MissionAssignation.DepartureTime,
                    ReturnDate = result.MissionAssignation.ReturnDate,
                    ReturnTime = result.MissionAssignation.ReturnTime,
                    Duration = result.MissionAssignation.Duration,
                    CreatedAt = result.MissionAssignation.CreatedAt,
                    UpdatedAt = result.MissionAssignation.UpdatedAt,
                    Employee = result.MissionAssignation.Employee,
                    Mission = result.MissionAssignation.Mission,
                    Transport = result.MissionAssignation.Transport
                } : null
            }).ToList();
        }

        private static void CreateExcelHeaders(IXLWorksheet worksheet)
        {
            const int tableStartRow = 1;
            var headers = new[] { 
                "Bénéficiaire", "Matricule", "Mission", "Lieu", "Date Mission", 
                "Date", "Transport", "Petit Déjeuner", "Déjeuner", "Dîner", "Hébergement"
            };
            
            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cell(tableStartRow, i + 1).Value = headers[i];
            }

            var headerRange = worksheet.Range($"A{tableStartRow}:K{tableStartRow}");
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        private static decimal CalculateExpenseAmount(List<CompensationScale> compensationScales, string expenseType)
        {
            return compensationScales
                .Where(scale => scale.ExpenseType?.Type == expenseType)
                .Sum(scale => scale.Amount);
        }

        private static decimal CalculateTransportAmount(List<CompensationScale> compensationScales, string? transportId)
        {
            return compensationScales
                .Where(scale => scale.TransportId == transportId && scale.TransportId != null)
                .Sum(scale => scale.Amount);
        }

        private static string FormatDate(DateTime? date)
        {
            try
            {
                return date?.ToString("dd/MM/yyyy") ?? "Non spécifié";
            }
            catch
            {
                return "Date invalide";
            }
        }

        public async Task<(IEnumerable<MissionAssignation>, int)> SearchAsync(
            MissionAssignationSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                var (results, totalCount) = await _repository.SearchAsync(filters, page, pageSize);
                return (results.Select(CreateMissionAssignationFromEntity), totalCount);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error searching mission assignations: {ex.Message}", ex);
            }
        }

        public async Task<(string EmployeeId, string MissionId, string? TransportId)> CreateAsync(MissionAssignation missionAssignation)
        {
            try
            {
                SetCreationTimestamps(missionAssignation);
                await SaveMissionAssignationAsync(missionAssignation);
                await UpdateMissionStatusAsync(missionAssignation.MissionId);

                return (missionAssignation.EmployeeId, missionAssignation.MissionId, missionAssignation.TransportId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating mission assignation: {ex.Message}", ex);
            }
        }

        private static void SetCreationTimestamps(MissionAssignation missionAssignation)
        {
            missionAssignation.CreatedAt = DateTime.UtcNow;
            missionAssignation.UpdatedAt = DateTime.UtcNow;
        }

        private async Task SaveMissionAssignationAsync(MissionAssignation missionAssignation)
        {
            await _repository.AddAsync(missionAssignation);
            await _repository.SaveChangesAsync();
        }

        private async Task UpdateMissionStatusAsync(string missionId)
        {
            var mission = await _missionService.GetByIdAsync(missionId);
            if (mission != null)
            {
                mission.Status = "Planifié";
                mission.UpdatedAt = DateTime.UtcNow;
                await _missionService.UpdateAsync(mission);
            }
        }

        public async Task<bool> UpdateAsync(MissionAssignation missionAssignation)
        {
            try
            {
                var existing = await GetExistingAssignationForUpdateAsync(missionAssignation);
                if (existing == null) return false;

                UpdateAssignationFields(existing, missionAssignation);
                await SaveUpdatedAssignationAsync(existing);
                
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error updating mission assignation: {ex.Message}", ex);
            }
        }

        private async Task<MissionAssignation?> GetExistingAssignationForUpdateAsync(MissionAssignation missionAssignation)
        {
            return await _repository.GetByIdAsync(missionAssignation.EmployeeId,
                missionAssignation.MissionId, missionAssignation.TransportId);
        }

        private static void UpdateAssignationFields(MissionAssignation existing, MissionAssignation updated)
        {
            existing.DepartureDate = updated.DepartureDate;
            existing.DepartureTime = updated.DepartureTime;
            existing.ReturnDate = updated.ReturnDate;
            existing.ReturnTime = updated.ReturnTime;
            existing.Duration = updated.Duration;
            existing.UpdatedAt = DateTime.UtcNow;
        }

        private async Task SaveUpdatedAssignationAsync(MissionAssignation existing)
        {
            await _repository.UpdateAsync(existing);
            await _repository.SaveChangesAsync();
        }

        public async Task<bool> DeleteAsync(string employeeId, string missionId, string transportId)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(employeeId, missionId, transportId);
                if (existing == null)
                {
                    return false;
                }

                await _repository.DeleteAsync(existing);
                await _repository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error deleting mission assignation: {ex.Message}", ex);
            }
        }

        // Méthodes obsolètes gardées pour compatibilité mais non utilisées dans la nouvelle version
        private async Task<IEnumerable<MissionPaiement>> GetValidatedPaymentData(string employeeId, string missionId)
        {
            var missionPaymentResult = await GeneratePaiementsAsync(employeeId, missionId);
            var missionPayments = ConvertToLegacyFormat(missionPaymentResult);

            var paymentsList = missionPayments?.ToList();

            if (paymentsList?.Any() != true)
            {
                throw new InvalidOperationException("No payment data found for the specified mission and employee.");
            }

            return paymentsList;
        }

        private byte[] CreateExcelReport(IEnumerable<MissionPaiement> missionPayments, MissionPaiementResult missionPaymentResult)
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Mission Payment Report");

            CreateExcelHeaders(worksheet);
            var transformedData = TransformPaymentDataForExcel(missionPayments, missionPaymentResult);
            WriteDataToWorksheet(worksheet, transformedData, 1);
            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private static List<ExcelRowData> TransformPaymentDataForExcel(IEnumerable<MissionPaiement> missionPayments, MissionPaiementResult missionPaymentResult)
        {
            var assignment = missionPaymentResult.MissionAssignation;
            var employee = assignment?.Employee;
            var mission = assignment?.Mission;

            return missionPayments.Select(item =>
            {
                var compensationScales = item.CompensationScales?.ToList() ?? new List<CompensationScale>();

                return new ExcelRowData
                {
                    Beneficiary = $"{employee?.FirstName} {employee?.LastName}",
                    EmployeeCode = employee?.EmployeeCode ?? string.Empty,
                    MissionName = mission?.Name ?? string.Empty,
                    MissionLocation = mission?.Lieu != null
                        ? $"{mission.Lieu.Nom}/{mission.Lieu.Pays}"
                        : string.Empty,

                    StartDate = assignment?.Mission?.StartDate,
                    Date = item.Date,
                    Transport = CalculateTransportAmount(compensationScales, assignment?.TransportId),
                    Breakfast = CalculateExpenseAmount(compensationScales, "Petit Déjeuner"),
                    Lunch = CalculateExpenseAmount(compensationScales, "Déjeuner"),
                    Dinner = CalculateExpenseAmount(compensationScales, "Dinner"),
                    Accommodation = CalculateExpenseAmount(compensationScales, "Hébergement"),
                };
            }).ToList();
        }

        private static void WriteDataToWorksheet(IXLWorksheet worksheet, List<ExcelRowData> transformedData, int tableStartRow)
        {
            for (int i = 0; i < transformedData.Count; i++)
            {
                var row = tableStartRow + i + 1;
                var data = transformedData[i];

                worksheet.Cell(row, 1).Value = data.Beneficiary;
                worksheet.Cell(row, 2).Value = data.EmployeeCode;
                worksheet.Cell(row, 3).Value = data.MissionName;
                worksheet.Cell(row, 4).Value = data.MissionLocation;
                worksheet.Cell(row, 5).Value = FormatDate(data.StartDate);
                worksheet.Cell(row, 6).Value = FormatDate(data.Date);
                worksheet.Cell(row, 7).Value = data.Transport;
                worksheet.Cell(row, 8).Value = data.Breakfast;
                worksheet.Cell(row, 9).Value = data.Lunch;
                worksheet.Cell(row, 10).Value = data.Dinner;
                worksheet.Cell(row, 11).Value = data.Accommodation;

                worksheet.Range($"H{row}:M{row}").Style.NumberFormat.Format = "#,##0";
            }
        }

        private class ExcelRowData
        {
            public string? Beneficiary { get; set; }
            public string? EmployeeCode { get; set; }
            public string? MissionName { get; set; }    
            public string? MissionLocation { get; set; }
            public DateTime? StartDate { get; set; }
            public DateTime? Date { get; set; }
            public decimal Transport { get; set; }
            public decimal Breakfast { get; set; }
            public decimal Lunch { get; set; }
            public decimal Dinner { get; set; }
            public decimal Accommodation { get; set; }
            public decimal Total { get; set; }
        }
    }
}