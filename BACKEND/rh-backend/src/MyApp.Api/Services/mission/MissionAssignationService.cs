using MyApp.Api.Entities.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;
using MyApp.Api.Models.search.mission;
using MyApp.Api.Services.employee;
using ClosedXML.Excel;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.classes.mission;
using MyApp.Api.Services.employe;
using System.Linq;

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
        Task<IEnumerable<MissionPaiement>> GeneratePaiementsAsync(string employeeId, string missionId);
        Task<byte[]> GenerateExcelReportAsync(string employeeId, string missionId);
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

        public async Task<IEnumerable<MissionPaiement>> GeneratePaiementsAsync(string employeeId, string missionId)
        {
            try
            {
                var missionAssignation = await GetMissionAssignationAsync(employeeId, missionId);
                var paiements = await GeneratePaymentsForAssignation(missionAssignation);
        
                var paiementsList = paiements?.ToList() ?? new List<MissionPaiement>();
        
                LogPaymentGenerationResult(paiementsList, employeeId, missionId);
                return paiementsList;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error generating payments: {ex.Message}", ex);
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

        private async Task<IEnumerable<MissionPaiement>> GeneratePaymentsForAssignation(MissionAssignation missionAssignation)
        {
            var missionPaiementLogger = _loggerFactory.CreateLogger<MissionPaiement>();
            var missionPaiement = new MissionPaiement(_categoriesOfEmployeeService);
            return await missionPaiement.GeneratePaiement(missionAssignation, _compensationScaleService);
        }

        private void LogPaymentGenerationResult(IEnumerable<MissionPaiement> paiements, string employeeId, string missionId)
        {
            // Méthode conservée pour compatibilité mais sans logs
        }

        public async Task<byte[]> GenerateExcelReportAsync(string employeeId, string missionId)
        {
            try
            {
                var missionPayments = await GetValidatedPaymentData(employeeId, missionId);
                return CreateExcelReport(missionPayments);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error generating Excel report: {ex.Message}", ex);
            }
        }

        private async Task<IEnumerable<MissionPaiement>> GetValidatedPaymentData(string employeeId, string missionId)
        {
            var missionPayments = await GeneratePaiementsAsync(employeeId, missionId);

            var paymentsList = missionPayments?.ToList();

            if (paymentsList?.Any() != true)
            {
                throw new InvalidOperationException("No payment data found for the specified mission and employee.");
            }

            return paymentsList;
        }

        private byte[] CreateExcelReport(IEnumerable<MissionPaiement> missionPayments)
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Mission Payment Report");

            CreateExcelHeaders(worksheet);
            var transformedData = TransformPaymentDataForExcel(missionPayments);
            WriteDataToWorksheet(worksheet, transformedData, 1);
            AddTotalRow(worksheet, transformedData, 1);
            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private static void CreateExcelHeaders(IXLWorksheet worksheet)
        {
            const int tableStartRow = 1;
            var headers = new[] { "Bénéficiaire", "Matricule", "Date", "Transport", "Petit Déjeuner", "Déjeuner", "Dîner", "Hébergement", "Montant Total" };
            
            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cell(tableStartRow, i + 1).Value = headers[i];
            }

            var headerRange = worksheet.Range($"A{tableStartRow}:I{tableStartRow}");
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        private static List<ExcelRowData> TransformPaymentDataForExcel(IEnumerable<MissionPaiement> missionPayments)
        {
            return missionPayments.Select(item =>
            {
                var compensationScales = item.CompensationScales?.ToList() ?? new List<CompensationScale>();
                var assignment = item.MissionAssignation;
                var employee = assignment?.Employee;

                return new ExcelRowData
                {
                    Beneficiary = $"{employee?.FirstName} {employee?.LastName}",
                    EmployeeCode = employee?.EmployeeCode ?? string.Empty,
                    Date = item.Date,
                    Transport = CalculateTransportAmount(compensationScales, assignment?.TransportId),
                    Breakfast = CalculateExpenseAmount(compensationScales, "Petit Déjeuner"),
                    Lunch = CalculateExpenseAmount(compensationScales, "Déjeuner"),
                    Dinner = CalculateExpenseAmount(compensationScales, "Diner"),
                    Accommodation = CalculateExpenseAmount(compensationScales, "Hébergement"),
                    Total = compensationScales.Sum(scale => scale.Amount)
                };
            }).ToList();
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

        private static void WriteDataToWorksheet(IXLWorksheet worksheet, List<ExcelRowData> transformedData, int tableStartRow)
        {
            for (int i = 0; i < transformedData.Count; i++)
            {
                var row = tableStartRow + i + 1;
                var data = transformedData[i];

                worksheet.Cell(row, 1).Value = data.Beneficiary;
                worksheet.Cell(row, 2).Value = data.EmployeeCode;
                worksheet.Cell(row, 3).Value = FormatDate(data.Date);
                worksheet.Cell(row, 4).Value = data.Transport;
                worksheet.Cell(row, 5).Value = data.Breakfast;
                worksheet.Cell(row, 6).Value = data.Lunch;
                worksheet.Cell(row, 7).Value = data.Dinner;
                worksheet.Cell(row, 8).Value = data.Accommodation;
                worksheet.Cell(row, 9).Value = data.Total;

                worksheet.Range($"D{row}:I{row}").Style.NumberFormat.Format = "#,##0";
            }
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

        private static void AddTotalRow(IXLWorksheet worksheet, List<ExcelRowData> transformedData, int tableStartRow)
        {
            var totalRow = tableStartRow + transformedData.Count + 1;
            worksheet.Cell(totalRow, 1).Value = "Total Cumulé";
            worksheet.Cell(totalRow, 9).Value = transformedData.Sum(x => x.Total);
            worksheet.Cell(totalRow, 9).Style.NumberFormat.Format = "#,##0";

            var totalRange = worksheet.Range($"A{totalRow}:I{totalRow}");
            totalRange.Style.Font.Bold = true;
            totalRange.FirstCell().Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
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

        private void LogSuccessfulUpdate(MissionAssignation existing)
        {
            // Méthode supprimée - logs retirés
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
    }
}