using MyApp.Api.Entities.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;
using MyApp.Api.Models.search.mission;
using MyApp.Api.Services.employee;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using ClosedXML.Excel;
using System.IO;
using System.Linq;

namespace MyApp.Api.Services.mission
{
    public interface IMissionAssignationService
    {
        Task<IEnumerable<MissionAssignation>> GetAllAsync();
        Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId, string transportId);
        Task<MissionAssignation?> GetByEmployeeIdMissionIdAsync(string employeeId, string missionId);
        Task<(IEnumerable<MissionAssignation>, int)> SearchAsync(MissionAssignationSearchFiltersDTO filters, int page, int pageSize);
        Task<(string EmployeeId, string MissionId, string TransportId)> CreateAsync(MissionAssignation missionAssignation);
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
        private readonly ILogger<MissionAssignationService> _logger;
        private readonly ILoggerFactory _loggerFactory;

        public MissionAssignationService(
            IMissionAssignationRepository repository,
            IMissionService missionService,
            ISequenceGenerator sequenceGenerator,
            ICompensationScaleService compensationScaleService,
            ICategoriesOfEmployeeService categoriesOfEmployeeService,
            ILogger<MissionAssignationService> logger,
            ILoggerFactory loggerFactory)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _missionService = missionService ?? throw new ArgumentNullException(nameof(missionService));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _compensationScaleService = compensationScaleService ?? throw new ArgumentNullException(nameof(compensationScaleService));
            _categoriesOfEmployeeService = categoriesOfEmployeeService ?? throw new ArgumentNullException(nameof(categoriesOfEmployeeService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
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

        public async Task<MissionAssignation?> GetByEmployeeIdMissionIdAsync(string employeeId, string missionId)
        {
            try
            {
                var missionAssignation = await _repository.GetByIdAsync(employeeId, missionId);
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
                    "Error retrieving mission assignation with EmployeeId: {EmployeeId}, MissionId: {MissionId}",
                    employeeId, missionId);
                throw new Exception($"Error retrieving mission assignation: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<MissionPaiement>> GeneratePaiementsAsync(string employeeId, string missionId)
        {
            try
            {
                _logger.LogInformation("Starting GeneratePaiementsAsync for EmployeeId: {EmployeeId}, MissionId: {MissionId}", 
                    employeeId, missionId);

                // Retrieve the mission assignation
                var missionAssignation = await GetByEmployeeIdMissionIdAsync(employeeId, missionId);
                if (missionAssignation == null)
                {
                    _logger.LogWarning("Mission assignation not found for EmployeeId: {EmployeeId}, MissionId: {MissionId}", 
                        employeeId, missionId);
                    throw new InvalidOperationException($"Mission assignation not found for EmployeeId: {employeeId}, MissionId: {missionId}");
                }

                // Create MissionPaiement instance with logger and ICategoriesOfEmployeeService
                var missionPaiementLogger = _loggerFactory.CreateLogger<MissionPaiement>();
                var missionPaiement = new MissionPaiement(missionPaiementLogger, _categoriesOfEmployeeService);
                var paiements = await missionPaiement.GeneratePaiement(missionAssignation, _compensationScaleService);

                if (paiements == null || !paiements.Any())
                {
                    _logger.LogWarning("No payments generated for EmployeeId: {EmployeeId}, MissionId: {MissionId}", 
                        employeeId, missionId);
                    return Array.Empty<MissionPaiement>();
                }

                _logger.LogInformation("Successfully generated {Count} payments for EmployeeId: {EmployeeId}, MissionId: {MissionId}", 
                    paiements.Count(), employeeId, missionId);
                return paiements;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating payments for EmployeeId: {EmployeeId}, MissionId: {MissionId}", 
                    employeeId, missionId);
                throw new Exception($"Error generating payments: {ex.Message}", ex);
            }
        }

        public async Task<byte[]> GenerateExcelReportAsync(string employeeId, string missionId)
        {
            try
            {
                _logger.LogInformation("Starting Excel report generation for EmployeeId: {EmployeeId}, MissionId: {MissionId}", 
                    employeeId, missionId);

                var missionPayments = await GeneratePaiementsAsync(employeeId, missionId);

                if (missionPayments == null || !missionPayments.Any())
                {
                    _logger.LogWarning("No payment data found for Excel generation - EmployeeId: {EmployeeId}, MissionId: {MissionId}", 
                        employeeId, missionId);
                    throw new InvalidOperationException("No payment data found for the specified mission and employee.");
                }

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Mission Payment Report");

                // Headers for the table
                int tableStartRow = 1;
                worksheet.Cell(tableStartRow, 1).Value = "Bénéficiaire";
                worksheet.Cell(tableStartRow, 2).Value = "Matricule";
                worksheet.Cell(tableStartRow, 3).Value = "Date";
                worksheet.Cell(tableStartRow, 4).Value = "Transport";
                worksheet.Cell(tableStartRow, 5).Value = "Petit Déjeuner";
                worksheet.Cell(tableStartRow, 6).Value = "Déjeuner";
                worksheet.Cell(tableStartRow, 7).Value = "Dîner";
                worksheet.Cell(tableStartRow, 8).Value = "Hébergement";
                worksheet.Cell(tableStartRow, 9).Value = "Montant Total";

                // Style headers
                var headerRange = worksheet.Range($"A{tableStartRow}:I{tableStartRow}");
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
                headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                // Transform data to match the required structure
                var transformedData = TransformPaymentDataForExcel(missionPayments);

                // Write data to worksheet
                WriteDataToWorksheet(worksheet, transformedData, tableStartRow);

                // Add cumulative total row
                AddTotalRow(worksheet, transformedData, tableStartRow);

                // Auto-fit columns
                worksheet.Columns().AdjustToContents();

                // Save to stream and return bytes
                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                
                _logger.LogInformation("Excel report successfully generated for EmployeeId: {EmployeeId}, MissionId: {MissionId}", 
                    employeeId, missionId);
                
                return stream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating Excel report for EmployeeId: {EmployeeId}, MissionId: {MissionId}", 
                    employeeId, missionId);
                throw new Exception($"Error generating Excel report: {ex.Message}", ex);
            }
        }

        private List<dynamic> TransformPaymentDataForExcel(IEnumerable<MissionPaiement> missionPayments)
        {
            return missionPayments.Select(item =>
            {
                var compensationScales = item.CompensationScales ?? new List<CompensationScale>();
                var assignment = item.MissionAssignation;
                var employee = assignment.Employee;

                var lunchAmount = compensationScales
                    .Where(scale => scale.ExpenseType?.Type == "Déjeuner")
                    .Sum(scale => scale.Amount);

                var dinnerAmount = compensationScales
                    .Where(scale => scale.ExpenseType?.Type == "Diner")
                    .Sum(scale => scale.Amount);

                var breakfastAmount = compensationScales
                    .Where(scale => scale.ExpenseType?.Type == "Petit Déjeuner")
                    .Sum(scale => scale.Amount);

                var accommodationAmount = compensationScales
                    .Where(scale => scale.ExpenseType?.Type == "Hébergement")
                    .Sum(scale => scale.Amount);

                var transportAmount = compensationScales
                    .Where(scale => scale.TransportId == assignment.TransportId && scale.TransportId != null)
                    .Sum(scale => scale.Amount);

                var totalAmount = compensationScales.Sum(scale => scale.Amount);

                return new
                {
                    Beneficiary = $"{employee.FirstName} {employee.LastName}",
                    EmployeeCode = employee.EmployeeCode,
                    Date = item.Date,
                    Transport = transportAmount,
                    Breakfast = breakfastAmount,
                    Lunch = lunchAmount,
                    Dinner = dinnerAmount,
                    Accommodation = accommodationAmount,
                    Total = totalAmount
                };
            }).ToList<dynamic>();
        }

        private void WriteDataToWorksheet(IXLWorksheet worksheet, List<dynamic> transformedData, int tableStartRow)
        {
            for (int i = 0; i < transformedData.Count; i++)
            {
                var row = tableStartRow + i + 1;
                var data = transformedData[i];
                
                worksheet.Cell(row, 1).Value = data.Beneficiary;
                worksheet.Cell(row, 2).Value = data.EmployeeCode;
                
                try
                {
                    worksheet.Cell(row, 3).Value = data.Date?.ToString("dd/MM/yyyy") ?? "Non spécifié";
                }
                catch
                {
                    worksheet.Cell(row, 3).Value = "Date invalide";
                }
                
                worksheet.Cell(row, 4).Value = data.Transport;
                worksheet.Cell(row, 5).Value = data.Breakfast;
                worksheet.Cell(row, 6).Value = data.Lunch;
                worksheet.Cell(row, 7).Value = data.Dinner;
                worksheet.Cell(row, 8).Value = data.Accommodation;
                worksheet.Cell(row, 9).Value = data.Total;

                // Apply number format for monetary columns
                worksheet.Range($"D{row}:I{row}").Style.NumberFormat.Format = "#,##0";
            }
        }

        private void AddTotalRow(IXLWorksheet worksheet, List<dynamic> transformedData, int tableStartRow)
        {
            var totalRow = tableStartRow + transformedData.Count + 1;
            worksheet.Cell(totalRow, 1).Value = "Total Cumulé";
            worksheet.Cell(totalRow, 9).Value = transformedData.Sum(x => (decimal)x.Total);
            worksheet.Cell(totalRow, 9).Style.NumberFormat.Format = "#,##0";

            // Style total row
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

                await _repository.AddAsync(missionAssignation);
                await _repository.SaveChangesAsync();

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