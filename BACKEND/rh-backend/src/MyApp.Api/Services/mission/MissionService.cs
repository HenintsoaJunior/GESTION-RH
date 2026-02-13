using MyApp.Api.Entities.mission;
using MyApp.Api.Models.classes.notifications;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.dto.notifications;
using MyApp.Api.Models.dto.prevision;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Models.list.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Services.employee;
using MyApp.Api.Services.logs;
using MyApp.Api.Services.notifications;
using MyApp.Api.Services.prevision;
using MyApp.Api.Services.users;
using MyApp.Api.Utils.generator;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Wordprocessing;
using ClosedXML.Excel;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.lieu;
using MyApp.Api.Utils.csv;
using MyApp.Api.Utils.exception;
using MyApp.Api.Utils.pdf;
using DocumentFormat.OpenXml.Packaging;
using SpireDoc = Spire.Doc;
using System.IO;
using MyApp.Api.Services.mission;
using MyApp.Api.enums;
using MyApp.Api.Data;
using System.Globalization;

namespace MyApp.Api.Services.mission
{
    public interface IMissionService
    {
        Task<MissionResultDTO?> VerifyMissionByNameAsync(string name);
        Task<(IEnumerable<MissionResultDTO>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Mission>> GetAllAsync();
        Task<Mission?> GetByIdAsync(string id);
        Task<Mission?> GetByIdAsync(string employeeId, string missionId);
        Task<string> CreateAsync(MissionDTOForm mission);
        Task<bool> UpdateAsync(string id, MissionDTOForm mission);
        Task<bool> DeleteAsync(string id, string userId);
        Task<MissionStats> GetStatisticsAsync(string[]? matricule = null);
        Task<bool> CancelAsync(string id, string userId);
        Task<int> GetOngoingMissionsCountAsync();
        Task<int> GetPlannedMissionsThisMonthCountAsync();
        Task<(int count, DateTime date)> GetPlannedMissionsThisDateCountWithDateAsync();
        Task<(decimal progressRate, DateTime calculationDate)> GetProgressRateAsync();
        Task<(decimal nationalRate, decimal internationalRate)> GetMissionTypesRateAsync();
        Task<decimal> GetTotalCompensationsAsync(string employeeId, string missionId);
        Task<byte[]> GenerateIMPDFAsync(string employeeId, string missionId);
        Task<byte[]> GenerateMissionOrderPDFAsync(string employeeId, string missionId);
        Task<byte[]> GenerateADHAsync(string employeeId, string missionId);
        Task<byte[]> GenerateATDPDFAsync(string employeeId);
        Task<byte[]> GenerateExcelReportAsync(string employeeId, string missionId);
        Task<(IEnumerable<Mission>, int)> GetWithCompensationByStatusAsync(CompensationStatusFilter filter, int page = 1, int pageSize = 10);
        Task<IEnumerable<Mission>> GetOngoingMissionsWithDetailsAsync();
        Task<bool> CloseAsync(string id, string userId);
    }

    public class MissionService : IMissionService
    {
        private readonly IMissionRepository _repository;
        private readonly IMissionValidationService _validationService;
        private readonly IUserService _userService;
        private readonly IEmployeeService _employeeService;
        private readonly ICompensationScaleService _compensationScaleService;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly INotificationsService _notificationsService;
        private readonly ILogger<MissionService> _logger;
        private readonly ILogService _logService;
        private readonly ILieuService _lieuService;
        private readonly IPrevisionPriceService _previsionPriceService;
        private readonly EmailSender _emailSender;
        private readonly ICompensationService _compensationService;

        private readonly IValidatorsFlowService _validatorsFlowService;
        private readonly AppDbContext _context;
        private record StatusChange(string Status);
        public MissionService(
            IMissionRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<MissionService> logger,
            IMissionValidationService validationService,
            IUserService userService,
            IEmployeeService employeeService,
            ICompensationScaleService compensationScaleService,
            INotificationsService notificationsService,
            ILogService logService,
            ILieuService lieuService,
            IPrevisionPriceService previsionPriceService,
            ICompensationService compensationService,
            IValidatorsFlowService validatorsFlowService,
            AppDbContext context,
            EmailSender emailSender)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _compensationService = compensationService ?? throw new ArgumentNullException(nameof(compensationService));
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _validationService = validationService ?? throw new ArgumentNullException(nameof(validationService));
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
            _employeeService = employeeService ?? throw new ArgumentNullException(nameof(employeeService));
            _compensationScaleService = compensationScaleService ?? throw new ArgumentNullException(nameof(compensationScaleService));
            _notificationsService = notificationsService ?? throw new ArgumentNullException(nameof(notificationsService));
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
            _lieuService = lieuService ?? throw new ArgumentNullException(nameof(lieuService));
            _previsionPriceService = previsionPriceService ?? throw new ArgumentNullException(nameof(previsionPriceService));
            _validatorsFlowService = validatorsFlowService ?? throw new ArgumentNullException(nameof(validatorsFlowService));
            
            _emailSender = emailSender ?? throw new ArgumentNullException(nameof(emailSender));
        }

        

        public async Task<bool> CloseAsync(string id, string userId)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                var mission = await _repository.GetByIdAsync(id);
                if (mission == null) 
                    return false;

                // Validation : seules les missions terminées peuvent être clôturées
                if (mission.Status != MissionStatus.Completed)
                {
                    throw new InvalidOperationException(
                        "Seules les missions terminées peuvent être clôturées.");
                }

                var oldStatus = mission.Status;
                
                // Appel du repository pour clôturer la mission
                var closeResult = await _repository.CloseAsync(id);
                
                if (!closeResult)
                {
                    throw new InvalidOperationException("Échec de la clôture de la mission.");
                }

                // Créer une notification
                var notification = new NotificationFormDTO
                {
                    Title = "Mission clôturée",
                    Message = $"La mission '{mission.Name}' a été clôturée.",
                    Type = "mission",
                    RelatedTable = "mission",
                    RelatedId = id,
                    Priority = 2,
                    UserIds = new List<string> { userId },
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationsService.CreateAsync(notification, transaction);

                // Log du changement de statut
                await _logService.LogStatusChangeAsync(
                    action: "CLOTURE",
                    tableName: "missions",
                    entity: mission,
                    propertyName: "Status",
                    oldValue: oldStatus.ToString(),
                    newValue: MissionStatus.Closed.ToString(),
                    userId: userId
                );

                await transaction.CommitAsync();
                return true;
            }
            catch (InvalidOperationException)
            {
                await transaction.RollbackAsync();
                throw;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de la clôture de la mission {Id}", id);
                throw new Exception($"Erreur lors de la clôture de la mission: {ex.Message}", ex);
            }
        }

        public async Task<IEnumerable<Mission>> GetOngoingMissionsWithDetailsAsync()
        {
            try
            {
                return await _repository.GetOngoingMissionsWithDetailsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des missions en cours avec détails");
                throw;
            }
        }
        
        private static void ApplyArialFont(Run run)
        {
            if (run.RunProperties == null)
            {
                run.RunProperties = new RunProperties();
            }
            var rFonts = new RunFonts()
            {
                Ascii = "Arial",
                HighAnsi = "Arial",
                ComplexScript = "Arial",
                EastAsia = "Arial"
            };
            run.RunProperties.AppendChild(rFonts);
            var fontSize = new FontSize() { Val = "16" };
            run.RunProperties.Append(fontSize);
        }

        public async Task<(IEnumerable<Mission>, int)> GetWithCompensationByStatusAsync(CompensationStatusFilter filter, int page = 1, int pageSize = 10)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1) pageSize = 10;

                var (missions, totalCount) = await _repository.GetWithCompensationByStatusAsync(filter, page, pageSize);

                return (missions, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des missions par statut de compensation");
                throw;
            }
        }


        public async Task<byte[]> GenerateIMPDFAsync(string employeeId, string missionId)
        {
            var mission = await _repository.GetByIdAsync(employeeId, missionId);
            
            var dto = await _compensationService.GetByEmployeeIdAsync(employeeId, missionId);
            if (dto.Compensations == null || !dto.Compensations.Any())
            {
                throw new InvalidOperationException("Aucune compensation trouvée pour cette assignation de mission.");
            }
            string templatePath = TemplatePathHelper.GetTemplatePath("IM.docx");
            if (!File.Exists(templatePath))
            {
                throw new FileNotFoundException("Le fichier modèle n'existe pas.", templatePath);
            }
            if (mission == null)
            {
                throw new InvalidOperationException($"Mission introuvable pour EmployeeId: {employeeId}, MissionId: {missionId}");
            }
            string datePart = mission.DepartureDate?.ToString("dd/MM/yyyy") ?? "";
            TimeSpan? depTime = mission.DepartureTime;
            string timePart = depTime.HasValue ? $"{depTime.Value.Hours:D2}:{depTime.Value.Minutes:D2}" : "";
            string datePartReturn = mission.ReturnDate?.ToString("dd/MM/yyyy") ?? "";
            
            TimeSpan? depTimeReturn = mission.ReturnTime;
            string timePartReturn = depTimeReturn.HasValue ? $"{depTimeReturn.Value.Hours:D2}:{depTimeReturn.Value.Minutes:D2}" : "";
            string transportStr = mission.Transport != null ? mission.Transport.Type ?? "" : "";
            if (string.IsNullOrEmpty(transportStr) && mission.MissionType != MissionType.National)
            {
                transportStr = "Avion";
            }
            var replacements = new Dictionary<string, string>
            {
                { "${ref}", mission.MissionId ?? "" },
                { "${date}", DateTime.Now.ToString("dd/MM/yyyy") },
                { "${page}", "1" },
                { "${titre_mission}", mission.Name ?? "" },
                { "${numero}",mission.MissionId ?? "" },
                { "${nom}", mission.Employee?.LastName ?? "" },
                { "${prenom}", mission.Employee?.FirstName ?? "" },
                { "${base}", mission.Employee?.Site?.Code ?? "" },
                { "${categorie}", "C"+mission.Employee?.Category ?? "" },
                { "${fonction}", mission.Employee?.JobTitle ?? "" },
                { "${matricule}", mission.Employee?.EmployeeCode ?? "" },
                { "${direction}", mission.Employee?.Direction?.DirectionName ?? "" },
                { "${service}", mission.Employee?.Service?.ServiceName?? "" },
                { "${lieu}", mission.Lieu?.Nom ?? "" },
                { "${motif}", mission.Description ?? "" },
                { "${transport}", transportStr },
                { "${date_heure_depart}", $"{datePart} {timePart}" },
                { "${date_heure_retour}", $"{datePartReturn} {timePartReturn}" },
                { "${date_creation}", DateTime.Now.ToString("dd/MM/yyyy") }
            };
            using var memoryStream = new MemoryStream();
            using (var fileStream = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
            {
                await fileStream.CopyToAsync(memoryStream);
            }
            memoryStream.Position = 0;
            using (WordprocessingDocument wordDoc = WordprocessingDocument.Open(memoryStream, true))
            {
                if (wordDoc.MainDocumentPart == null || wordDoc.MainDocumentPart.Document == null)
                {
                    throw new InvalidOperationException("Le document Word ne contient pas de partie principale ou de document.");
                }
                var body = wordDoc.MainDocumentPart.Document.Body;
                // Remplacements textuels standards
                if (body != null)
                {
                    var textElements = body.Descendants<Text>().ToList();
                    foreach (var text in textElements)
                    {
                        if (text.Text != null)
                        {
                            foreach (var replacement in replacements)
                            {
                                if (text.Text.Contains(replacement.Key))
                                {
                                    text.Text = text.Text.Replace(replacement.Key, replacement.Value);
                                }
                            }
                        }
                    }
                    var bodyRuns = body.Descendants<Run>().ToList();
                    foreach (var run in bodyRuns)
                    {
                        string runText = string.Join("", run.Descendants<Text>().Select(t => t.Text ?? ""));
                        foreach (var replacement in replacements)
                        {
                            if (runText.Contains(replacement.Key))
                            {
                                run.RemoveAllChildren<Text>();
                                string newText = runText.Replace(replacement.Key, replacement.Value);
                                run.AppendChild(new Text(newText));
                            }
                        }
                    }
                }
                // Insertion du tableau pour ${tableau}
                if (body != null)
                {
                    string placeholderText = "${tableau}";
                    var paragraphs = body.Descendants<Paragraph>().ToList();
                    Paragraph? targetParagraph = null;
                    Run? runToRemove = null;
                    foreach (var p in paragraphs)
                    {
                        string texts = string.Join("", p.Descendants<Text>().Select(t => t.Text ?? ""));
                        if (texts.Contains(placeholderText))
                        {
                            targetParagraph = p;
                            runToRemove = p.Descendants<Run>().FirstOrDefault(r =>
                                r.Descendants<Text>().Any(t => (t.Text ?? "").Contains(placeholderText)));
                            break;
                        }
                    }
                    if (targetParagraph != null && runToRemove != null)
                    {
                        runToRemove.Remove();
                        bool isInternational = mission?.MissionType != MissionType.National;
                        var table = new Table();
                        var tableProperties = new TableProperties();
                        tableProperties.Append(new TableStyle() { Val = "TableGrid" });
                        var tableWidth = new TableWidth() { Type = TableWidthUnitValues.Dxa, Width = "9026" };
                        tableProperties.Append(tableWidth);
                        var tableLayout = new TableLayout() { Type = TableLayoutValues.Fixed };
                        tableProperties.Append(tableLayout);
                        table.AppendChild(tableProperties);
                        string[] headers;
                        string[] widths;
                        if (isInternational)
                        {
                            headers = new[] { "Date", "Transport", "Petit Déjeuner", "Déjeuner", "Dîner", "Hébergement", "Communication", "Visa sur place", "Frais médicaux", "Taxes", "Montant Total" };
                            widths = new[] { "1266", "766", "766", "766", "766", "766", "766", "766", "766", "766", "866" };
                        }
                        else
                        {
                            headers = new[] { "Date", "Transport", "Petit Déjeuner", "Déjeuner", "Dîner", "Hébergement", "Montant Total" };
                            widths = new[] { "1547", "1147", "1147", "1147", "1147", "1147", "1747" };
                        }
                        // Ligne d'en-tête
                        var headerRow = new TableRow();
                        for (int i = 0; i < headers.Length; i++)
                        {
                            var headerCell = new TableCell(new Paragraph(new Run(new Text(headers[i]))));
                            ApplyArialFont(headerCell.Descendants<Run>().First());
                            var headerRun = headerCell.Descendants<Run>().First();
                            headerRun.RunProperties ??= new RunProperties();
                            headerRun.RunProperties.Append(new Bold());
                            var cellProperties = new TableCellProperties(new TableCellWidth() { Type = TableWidthUnitValues.Dxa, Width = widths[i] });
                            var borders = new TableCellBorders(
                                new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" }
                            );
                            cellProperties.Append(borders);
                            var headerParagraph = headerCell.Descendants<Paragraph>().First();
                            headerParagraph.ParagraphProperties ??= new ParagraphProperties();
                            headerParagraph.ParagraphProperties.Append(new Justification() { Val = JustificationValues.Center });
                            headerCell.Append(cellProperties);
                            headerRow.Append(headerCell);
                        }
                        var headerRowProperties = new TableRowProperties(new TableHeader());
                        headerRow.PrependChild(headerRowProperties);
                        table.Append(headerRow);
                        // Lignes de données
                        foreach (var comp in dto.Compensations.OrderBy(c => c.PaymentDate))
                        {
                            string[] values;
                            if (isInternational)
                            {
                                var dailyTotal = comp.TransportAmount + comp.BreakfastAmount + comp.LunchAmount + comp.DinnerAmount + comp.AccommodationAmount + comp.TaxesAmount;
                                values = new[] {
                                    comp.PaymentDate?.ToString("dd/MM/yyyy") ?? "",
                                    comp.TransportAmount.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                    comp.BreakfastAmount.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                    comp.LunchAmount.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                    comp.DinnerAmount.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                    comp.AccommodationAmount.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                    "0,00",
                                    "0,00",
                                    "0,00",
                                    comp.TaxesAmount.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                    dailyTotal.ToString("N2", new System.Globalization.CultureInfo("fr-FR"))
                                };
                            }
                            else
                            {
                                var totalRowAmount = comp.TransportAmount + comp.BreakfastAmount + comp.LunchAmount + comp.DinnerAmount + comp.AccommodationAmount;
                                values = new[] {
                                    comp.PaymentDate?.ToString("dd/MM/yyyy") ?? "",
                                    comp.TransportAmount.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                    comp.BreakfastAmount.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                    comp.LunchAmount.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                    comp.DinnerAmount.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                    comp.AccommodationAmount.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                    totalRowAmount.ToString("N2", new System.Globalization.CultureInfo("fr-FR"))
                                };
                            }
                            var dataRow = new TableRow();
                            for (int i = 0; i < values.Length; i++)
                            {
                                var dataCell = new TableCell(new Paragraph(new Run(new Text(values[i]))));
                                ApplyArialFont(dataCell.Descendants<Run>().First());
                                var cellProperties = new TableCellProperties(new TableCellWidth() { Type = TableWidthUnitValues.Dxa, Width = widths[i] });
                                var borders = new TableCellBorders(
                                    new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" }
                                );
                                cellProperties.Append(borders);
                                var paragraph = dataCell.Descendants<Paragraph>().First();
                                paragraph.ParagraphProperties ??= new ParagraphProperties();
                                if (i > 0)
                                {
                                    paragraph.ParagraphProperties.Append(new Justification() { Val = JustificationValues.Right });
                                }
                                else
                                {
                                    paragraph.ParagraphProperties.Append(new Justification() { Val = JustificationValues.Left });
                                }
                                dataCell.Append(cellProperties);
                                dataRow.Append(dataCell);
                            }
                            table.Append(dataRow);
                        }
                        // Ligne des frais uniques pour missions internationales
                        if (isInternational)
                        {
                            var totalCommunication = dto.Compensations.Sum(c => c.CommunicationAmount);
                            var totalVisa = dto.Compensations.Sum(c => c.VisaAmount);
                            var totalMedicaux = dto.Compensations.Sum(c => c.MedicalExpensesAmount);
                            var oneTimeTotal = totalCommunication + totalVisa + totalMedicaux;
                            var oneTimeValues = new[] {
                                "",
                                "",
                                "",
                                "",
                                "",
                                "",
                                totalCommunication.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                totalVisa.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                totalMedicaux.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                "",
                                oneTimeTotal.ToString("N2", new System.Globalization.CultureInfo("fr-FR"))
                            };
                            var oneTimeRow = new TableRow();
                            for (int i = 0; i < oneTimeValues.Length; i++)
                            {
                                var oneTimeCell = new TableCell(new Paragraph(new Run(new Text(oneTimeValues[i]))));
                                ApplyArialFont(oneTimeCell.Descendants<Run>().First());
                                var cellProperties = new TableCellProperties(new TableCellWidth() { Type = TableWidthUnitValues.Dxa, Width = widths[i] });
                                var borders = new TableCellBorders(
                                    new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" }
                                );
                                cellProperties.Append(borders);
                                var paragraph = oneTimeCell.Descendants<Paragraph>().First();
                                paragraph.ParagraphProperties ??= new ParagraphProperties();
                                paragraph.ParagraphProperties.Append(new Justification() { Val = JustificationValues.Right });
                                oneTimeCell.Append(cellProperties);
                                var run = oneTimeCell.Descendants<Run>().First();
                                run.RunProperties ??= new RunProperties();
                                run.RunProperties.Append(new Bold());
                                oneTimeRow.Append(oneTimeCell);
                            }
                            table.Append(oneTimeRow);
                        }
                        // Ligne de total
                        var totalTransport = dto.Compensations.Sum(c => c.TransportAmount);
                        var totalPetitDej = dto.Compensations.Sum(c => c.BreakfastAmount);
                        var totalDejeuner = dto.Compensations.Sum(c => c.LunchAmount);
                        var totalDiner = dto.Compensations.Sum(c => c.DinnerAmount);
                        var totalHebergement = dto.Compensations.Sum(c => c.AccommodationAmount);
                        var grandTotal = totalTransport + totalPetitDej + totalDejeuner + totalDiner + totalHebergement;
                        if (isInternational)
                        {
                            var totalCommunication = dto.Compensations.Sum(c => c.CommunicationAmount);
                            var totalVisa = dto.Compensations.Sum(c => c.VisaAmount);
                            var totalMedicaux = dto.Compensations.Sum(c => c.MedicalExpensesAmount);
                            var totalTaxes = dto.Compensations.Sum(c => c.TaxesAmount);
                            grandTotal += totalCommunication + totalVisa + totalMedicaux + totalTaxes;
                            var totalValues = new[] {
                                "Total",
                                "", "", "", "", "", "", "", "", "", 
                                grandTotal.ToString("N2", new System.Globalization.CultureInfo("fr-FR"))
                            };
                            var totalRow = new TableRow();
                            for (int i = 0; i < totalValues.Length; i++)
                            {
                                var totalCell = new TableCell(new Paragraph(new Run(new Text(totalValues[i]))));
                                ApplyArialFont(totalCell.Descendants<Run>().First());
                                var cellProperties = new TableCellProperties(new TableCellWidth() { Type = TableWidthUnitValues.Dxa, Width = widths[i] });
                                var borders = new TableCellBorders(
                                    new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" }
                                );
                                cellProperties.Append(borders);
                                var paragraph = totalCell.Descendants<Paragraph>().First();
                                paragraph.ParagraphProperties ??= new ParagraphProperties();
                                paragraph.ParagraphProperties.Append(new Justification() { Val = JustificationValues.Right });
                                totalCell.Append(cellProperties);
                                if (i == 0 || i == totalValues.Length - 1)
                                {
                                    var run = totalCell.Descendants<Run>().First();
                                    run.RunProperties ??= new RunProperties();
                                    run.RunProperties.Append(new Bold());
                                }
                                totalRow.Append(totalCell);
                            }
                            table.Append(totalRow);
                        }
                        else
                        {
                            var totalValues = new[] {
                                "Total",
                                totalTransport.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                totalPetitDej.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                totalDejeuner.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                totalDiner.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                totalHebergement.ToString("N2", new System.Globalization.CultureInfo("fr-FR")),
                                grandTotal.ToString("N2", new System.Globalization.CultureInfo("fr-FR"))
                            };
                            var totalRow = new TableRow();
                            for (int i = 0; i < totalValues.Length; i++)
                            {
                                var totalCell = new TableCell(new Paragraph(new Run(new Text(totalValues[i]))));
                                ApplyArialFont(totalCell.Descendants<Run>().First());
                                var cellProperties = new TableCellProperties(new TableCellWidth() { Type = TableWidthUnitValues.Dxa, Width = widths[i] });
                                var borders = new TableCellBorders(
                                    new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" }
                                );
                                cellProperties.Append(borders);
                                var paragraph = totalCell.Descendants<Paragraph>().First();
                                paragraph.ParagraphProperties ??= new ParagraphProperties();
                                paragraph.ParagraphProperties.Append(new Justification() { Val = JustificationValues.Right });
                                totalCell.Append(cellProperties);
                                if (i == 0 || i == totalValues.Length - 1)
                                {
                                    var run = totalCell.Descendants<Run>().First();
                                    run.RunProperties ??= new RunProperties();
                                    run.RunProperties.Append(new Bold());
                                }
                                totalRow.Append(totalCell);
                            }
                            table.Append(totalRow);
                        }
                        targetParagraph.InsertAfterSelf(table);
                    }
                }
                // Remplacements dans les en-têtes et pieds de page
                foreach (var headerPart in wordDoc.MainDocumentPart.HeaderParts)
                {
                    var headerTexts = headerPart.Header.Descendants<Text>().ToList();
                    foreach (var text in headerTexts)
                    {
                        if (text.Text != null)
                        {
                            foreach (var replacement in replacements)
                            {
                                if (text.Text.Contains(replacement.Key))
                                {
                                    text.Text = text.Text.Replace(replacement.Key, replacement.Value);
                                }
                            }
                        }
                    }
                }
                foreach (var footerPart in wordDoc.MainDocumentPart.FooterParts)
                {
                    var footerTexts = footerPart.Footer.Descendants<Text>().ToList();
                    foreach (var text in footerTexts)
                    {
                        if (text.Text != null)
                        {
                            foreach (var replacement in replacements)
                            {
                                if (text.Text.Contains(replacement.Key))
                                {
                                    text.Text = text.Text.Replace(replacement.Key, replacement.Value);
                                }
                            }
                        }
                    }
                }
                wordDoc.MainDocumentPart.Document.Save();
            }
            memoryStream.Position = 0;
            using var PDFStream = new MemoryStream();
            SpireDoc.Document doc = new SpireDoc.Document();
            doc.LoadFromStream(memoryStream, SpireDoc.FileFormat.Docx);
            doc.SaveToStream(PDFStream, SpireDoc.FileFormat.PDF);
            return PDFStream.ToArray();
        }


        public async Task<byte[]> GenerateMissionOrderPDFAsync(string employeeId, string missionId)
        {
            var mission = await _repository.GetByIdAsync(employeeId, missionId);
            if (mission == null)
            {
                throw new InvalidOperationException($"Mission not found for EmployeeId: {employeeId}, MissionId: {missionId}");
            }
            string templatePath = TemplatePathHelper.GetTemplatePath("OM.docx");
            
            if (!File.Exists(templatePath))
            {
                throw new FileNotFoundException("Le fichier modèle n'existe pas.", templatePath);
            }
            var replacements = new Dictionary<string, string>
            {
                { "${ref}", mission.MissionId ?? "" },
                { "${date}", DateTime.Now.ToString("dd/MM/yyyy") },
                { "${page}", "1" },
                { "${titre_mission}", mission.Name ?? "" },
                { "${numero}",mission.MissionId ?? "" },
                { "${nom}", mission.Employee?.LastName ?? "" },
                { "${prenom}", mission.Employee?.FirstName ?? "" },
                { "${fonction}", mission.Employee?.JobTitle ?? "" },
                { "${matricule}", mission.Employee?.EmployeeCode ?? "" },
                { "${direction}", mission.Employee?.Direction?.DirectionName ?? "" },
                { "${departement}", mission.Employee?.Department?.DepartmentName ?? "" },
                { "${service}", mission.Employee?.Service?.ServiceName?? "" },
                { "${lieu}", mission.Lieu?.Nom ?? "" },
                { "${motif}", mission.Description ?? "" },
                { "${transport}", mission.Transport != null ? mission.Transport.Type ?? "" : "" },
                { "${date_heure_depart}", $"{mission.DepartureDate:dd/MM/yyyy} {mission.DepartureTime?.ToString(@"hh\:mm") ?? ""}" },
                { "${date_heure_retour}", $"{mission.ReturnDate:dd/MM/yyyy} {mission.ReturnTime?.ToString(@"hh\:mm") ?? ""}" }
            };
            using var memoryStream = new MemoryStream();
            using (var fileStream = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
            {
                await fileStream.CopyToAsync(memoryStream);
            }
            memoryStream.Position = 0;
            using (WordprocessingDocument wordDoc = WordprocessingDocument.Open(memoryStream, true))
            {
                if (wordDoc.MainDocumentPart == null || wordDoc.MainDocumentPart.Document == null)
                {
                    throw new InvalidOperationException("Le document Word ne contient pas de partie principale ou de document.");
                }
                var body = wordDoc.MainDocumentPart.Document.Body;
                if (body != null)
                {
                    var textElements = body.Descendants<Text>().ToList();
                    foreach (var text in textElements)
                    {
                        foreach (var replacement in replacements)
                        {
                            if (text.Text.Contains(replacement.Key))
                            {
                                text.Text = text.Text.Replace(replacement.Key, replacement.Value);
                            }
                        }
                    }
                    var bodyRuns = body.Descendants<Run>().ToList();
                    foreach (var run in bodyRuns)
                    {
                        string runText = string.Join("", run.Descendants<Text>().Select(t => t.Text));
                        foreach (var replacement in replacements)
                        {
                            if (runText.Contains(replacement.Key))
                            {
                                run.RemoveAllChildren<Text>();
                                string newText = runText.Replace(replacement.Key, replacement.Value);
                                run.AppendChild(new Text(newText));
                            }
                        }
                    }
                }
                foreach (var headerPart in wordDoc.MainDocumentPart.HeaderParts)
                {
                    var headerTexts = headerPart.Header.Descendants<Text>().ToList();
                    foreach (var text in headerTexts)
                    {
                        foreach (var replacement in replacements)
                        {
                            if (text.Text.Contains(replacement.Key))
                            {
                                text.Text = text.Text.Replace(replacement.Key, replacement.Value);
                            }
                        }
                    }
                }
                foreach (var footerPart in wordDoc.MainDocumentPart.FooterParts)
                {
                    var footerTexts = footerPart.Footer.Descendants<Text>().ToList();
                    foreach (var text in footerTexts)
                    {
                        foreach (var replacement in replacements)
                        {
                            if (text.Text.Contains(replacement.Key))
                            {
                                text.Text = text.Text.Replace(replacement.Key, replacement.Value);
                            }
                        }
                    }
                }
                wordDoc.MainDocumentPart.Document.Save();
            }
            memoryStream.Position = 0;
            using var PDFStream = new MemoryStream();
            SpireDoc.Document doc = new SpireDoc.Document();
            doc.LoadFromStream(memoryStream, SpireDoc.FileFormat.Docx);
            doc.SaveToStream(PDFStream, SpireDoc.FileFormat.PDF);
            return PDFStream.ToArray();
        }


        public async Task<byte[]> GenerateADHAsync(string employeeId, string missionId)
        {
            var mission = await _repository.GetByIdAsync(employeeId, missionId);
            var accommodation_amount = await _compensationService.GetTotalAccommodationAmountAsync(missionId);
            if (mission == null)
            {
                throw new InvalidOperationException($"Mission not found for EmployeeId: {employeeId}, MissionId: {missionId}");
            }
            string templatePath = TemplatePathHelper.GetTemplatePath("ATH.docx");
            
            if (!File.Exists(templatePath))
            {
                throw new FileNotFoundException("Le fichier modèle n'existe pas.", templatePath);
            }
            var replacements = new Dictionary<string, string>
            {
                { "${date_delivrance}", DateTime.Now.ToString("dd/MM/yyyy") },
                { "${nom}", mission.Employee?.LastName ?? "" },
                { "${prenom}", mission.Employee?.FirstName ?? "" },
                { "${poste}", mission.Employee?.JobTitle ?? "" },
                { "${montant}", accommodation_amount.ToFormattedString() }
            };
            using var memoryStream = new MemoryStream();
            using (var fileStream = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
            {
                await fileStream.CopyToAsync(memoryStream);
            }
            memoryStream.Position = 0;
            using (WordprocessingDocument wordDoc = WordprocessingDocument.Open(memoryStream, true))
            {
                if (wordDoc.MainDocumentPart == null || wordDoc.MainDocumentPart.Document == null)
                {
                    throw new InvalidOperationException("Le document Word ne contient pas de partie principale ou de document.");
                }
                var body = wordDoc.MainDocumentPart.Document.Body;
                if (body != null)
                {
                    var textElements = body.Descendants<Text>().ToList();
                    foreach (var text in textElements)
                    {
                        foreach (var replacement in replacements)
                        {
                            if (text.Text.Contains(replacement.Key))
                            {
                                text.Text = text.Text.Replace(replacement.Key, replacement.Value);
                            }
                        }
                    }
                    var bodyRuns = body.Descendants<Run>().ToList();
                    foreach (var run in bodyRuns)
                    {
                        string runText = string.Join("", run.Descendants<Text>().Select(t => t.Text));
                        foreach (var replacement in replacements)
                        {
                            if (runText.Contains(replacement.Key))
                            {
                                run.RemoveAllChildren<Text>();
                                string newText = runText.Replace(replacement.Key, replacement.Value);
                                run.AppendChild(new Text(newText));
                            }
                        }
                    }
                }
                foreach (var headerPart in wordDoc.MainDocumentPart.HeaderParts)
                {
                    var headerTexts = headerPart.Header.Descendants<Text>().ToList();
                    foreach (var text in headerTexts)
                    {
                        foreach (var replacement in replacements)
                        {
                            if (text.Text.Contains(replacement.Key))
                            {
                                text.Text = text.Text.Replace(replacement.Key, replacement.Value);
                            }
                        }
                    }
                }
                foreach (var footerPart in wordDoc.MainDocumentPart.FooterParts)
                {
                    var footerTexts = footerPart.Footer.Descendants<Text>().ToList();
                    foreach (var text in footerTexts)
                    {
                        foreach (var replacement in replacements)
                        {
                            if (text.Text.Contains(replacement.Key))
                            {
                                text.Text = text.Text.Replace(replacement.Key, replacement.Value);
                            }
                        }
                    }
                }
                wordDoc.MainDocumentPart.Document.Save();
            }
            memoryStream.Position = 0;
            using var PDFStream = new MemoryStream();
            SpireDoc.Document doc = new SpireDoc.Document();
            doc.LoadFromStream(memoryStream, SpireDoc.FileFormat.Docx);
            doc.SaveToStream(PDFStream, SpireDoc.FileFormat.PDF);
            return PDFStream.ToArray();
        }

        public async Task<byte[]> GenerateATDPDFAsync(string employeeId)
        {
            var employee = await _employeeService.GetByIdAsync(employeeId);
            if (employee == null)
            {
                throw new InvalidOperationException($"Mission assignation not found for EmployeeId: {employeeId}");
            }

            string templatePath = TemplatePathHelper.GetTemplatePath("ATD.docx");
            if (!File.Exists(templatePath))
            {
                throw new FileNotFoundException("Le fichier modèle n'existe pas.", templatePath);
            }
            var replacements = new Dictionary<string, string>
            {
                {
                "${nom}", employee?.FirstName ?? ""
                },
                {
                    "${prenom}", employee?.LastName ?? ""
                },
                {
                    "${date_naissance}", employee?.BirthDate?.ToString("dd/MM/yyyy") ?? ""
                },
                {
                    "${lieu_naissance}", employee?.BirthPlace ?? ""
                },
                {
                    "${numero_cin}", employee?.IdNumber ?? ""
                },
                {
                    "${date_cin}", employee?.IdIssueDate?.ToString("dd/MM/yyyy") ?? ""
                },
                {
                    "${lieu_cin}", employee?.IdIssuePlace ?? ""
                },
                {
                    "${poste}", employee?.JobTitle ?? ""
                },
                {
                    "${date_embauche}", employee?.HireDate?.ToString("dd/MM/yyyy") ?? ""
                },
                {
                    "${categorie}", "C"+employee?.Category ?? ""
                },
                {
                    "${date_delivrance}", DateTime.Now.ToString("dd/MM/yyyy")
                },
                {
                    "${contract_type}", employee?.ContractType!.Label ?? ""
                },
            };
            using var memoryStream = new MemoryStream();

            using (var fileStream = new FileStream(templatePath, FileMode.Open, FileAccess.Read))
            {
                await fileStream.CopyToAsync(memoryStream);
            }

            memoryStream.Position = 0;
            using (WordprocessingDocument wordDoc = WordprocessingDocument.Open(memoryStream, true))
            {
                if (wordDoc.MainDocumentPart == null || wordDoc.MainDocumentPart.Document == null)
                {
                    throw new InvalidOperationException("Le document Word ne contient pas de partie principale ou de document.");
                }
                var body = wordDoc.MainDocumentPart.Document.Body;
                if (body != null)
                {
                    var textElements = body.Descendants<Text>().ToList();
                    foreach (var text in textElements)
                    {
                        foreach (var replacement in replacements)
                        {
                            if (text.Text.Contains(replacement.Key))
                            {
                                text.Text = text.Text.Replace(replacement.Key, replacement.Value);
                            }
                        }
                    }
                    var bodyRuns = body.Descendants<Run>().ToList();
                    foreach (var run in bodyRuns)
                    {
                        string runText = string.Join("", run.Descendants<Text>().Select(t => t.Text));
                    
                        foreach (var replacement in replacements)
                        {
                            if (runText.Contains(replacement.Key))
                            {
                                run.RemoveAllChildren<Text>();
                                string newText = runText.Replace(replacement.Key, replacement.Value);
                                run.AppendChild(new Text(newText));
                            }
                        }
                    }
                }
                foreach (var headerPart in wordDoc.MainDocumentPart.HeaderParts)
                {
                    var headerTexts = headerPart.Header.Descendants<Text>().ToList();
                    foreach (var text in headerTexts)
                    {
                        foreach (var replacement in replacements)
                        {
                            if (text.Text.Contains(replacement.Key))
                            {
                                text.Text = text.Text.Replace(replacement.Key, replacement.Value);
                            }
                        }
                    }
                }
                foreach (var footerPart in wordDoc.MainDocumentPart.FooterParts)
                {
                    var footerTexts = footerPart.Footer.Descendants<Text>().ToList();
                    foreach (var text in footerTexts)
                    {
                        foreach (var replacement in replacements)
                        {
                            if (text.Text.Contains(replacement.Key))
                            {
                                text.Text = text.Text.Replace(replacement.Key, replacement.Value);
                            }
                        }
                    }
                }
                wordDoc.MainDocumentPart.Document.Save();
            }
            memoryStream.Position = 0;
            using var PDFStream = new MemoryStream();

            SpireDoc.Document doc = new SpireDoc.Document();
            doc.LoadFromStream(memoryStream, SpireDoc.FileFormat.Docx);
            doc.SaveToStream(PDFStream, SpireDoc.FileFormat.PDF);
            return PDFStream.ToArray();
        }


        
        
        public async Task<byte[]> GenerateExcelReportAsync(string employeeId, string missionId)
        {
            try
            {
                var mission = await _repository.GetByIdAsync(employeeId, missionId);

                if (mission == null)
                {
                    return CreateEmptyExcelReport();
                }

                var allCompensations = new List<Compensation>();

                try
                {
                    var dto = await _compensationService.GetByEmployeeIdAsync(mission.EmployeeId, mission.MissionId);
                    allCompensations.AddRange(dto.Compensations);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, 
                        "Erreur lors de la récupération des compensations pour EmployeeId={EmployeeId}, MissionId={MissionId}",
                        mission.EmployeeId, mission.MissionId);
                }

                var compensations = allCompensations
                    .OrderBy(c => c.PaymentDate)
                    .ToList();

                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Mission Payment Report");
                CreateExcelHeaders(worksheet);

                if (!compensations.Any())
                {
                    worksheet.Cell(2, 1).Value = "Aucune donnée de compensation trouvée pour cette mission.";
                    worksheet.Range("A2:O2").Merge();
                    worksheet.Columns().AdjustToContents();

                    using var emptyStream = new MemoryStream(); 
                    workbook.SaveAs(emptyStream);
                    return emptyStream.ToArray();
                }

                var currentRow = 2;
                foreach (var compensation in compensations)
                {
                    WriteCompensationRowToWorksheet(worksheet, compensation, currentRow);
                    currentRow++;
                }

                worksheet.Range(2, 7, currentRow - 1, 15).Style.NumberFormat.Format = "#,##0.00";
                worksheet.Columns().AdjustToContents();

                using var excelStream = new MemoryStream();
                workbook.SaveAs(excelStream);
                return excelStream.ToArray();
            }
            catch (Exception ex)
            {
                throw new Exception("Une erreur est survenue lors de la génération du rapport Excel.", ex);
            }
        }

        private static void WriteCompensationRowToWorksheet(IXLWorksheet worksheet, Compensation compensation, int row)
        {
            var employee = compensation.Employee;
            var mission = compensation.Mission;
            var lieu = mission!.Lieu;
            worksheet.Cell(row, 1).Value = $"{employee?.FirstName} {employee?.LastName}";
            worksheet.Cell(row, 2).Value = employee?.EmployeeCode ?? string.Empty;
            worksheet.Cell(row, 3).Value = mission?.Name ?? string.Empty;
            worksheet.Cell(row, 4).Value = $"{lieu?.Nom}/{lieu?.Pays}";
            worksheet.Cell(row, 5).Value = FormatDate(mission?.StartDate);
            worksheet.Cell(row, 6).Value = FormatDate(compensation.PaymentDate);
            worksheet.Cell(row, 7).Value = compensation.TransportAmount;
            worksheet.Cell(row, 8).Value = compensation.BreakfastAmount;
            worksheet.Cell(row, 9).Value = compensation.LunchAmount;
            worksheet.Cell(row, 10).Value = compensation.DinnerAmount;
            worksheet.Cell(row, 11).Value = compensation.AccommodationAmount;
            worksheet.Cell(row, 12).Value = compensation.CommunicationAmount;
            worksheet.Cell(row, 13).Value = compensation.VisaAmount;
            worksheet.Cell(row, 14).Value = compensation.MedicalExpensesAmount;
            worksheet.Cell(row, 15).Value = compensation.TaxesAmount;
        }
        private byte[] CreateEmptyExcelReport()
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Mission Payment Report");
     
            CreateExcelHeaders(worksheet);
     
            worksheet.Cell(2, 1).Value = "Aucune affectation trouvée pour les critères spécifiés";
            worksheet.Range("A2:O2").Merge();
            worksheet.Cell(2, 1).Style.Font.Italic = true;
            worksheet.Cell(2, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
     
            worksheet.Columns().AdjustToContents();
            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
        private static void CreateExcelHeaders(IXLWorksheet worksheet)
        {
            const int tableStartRow = 1;
            var headers = new[] {
                "Missionaire", "Matricule", "Mission", "Lieu", "Date Mission",
                "Date", "Transport", "Petit Déjeuner", "Déjeuner", "Dinner", "Hébergement",
                "Communication", "Visa sur place", "Frais médicaux", "Taxes"
            };
     
            for (int i = 0; i < headers.Length; i++)
            {
                worksheet.Cell(tableStartRow, i + 1).Value = headers[i];
            }
            var headerRange = worksheet.Range($"A{tableStartRow}:O{tableStartRow}");
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;
            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
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

        public async Task<decimal> GetTotalCompensationsAsync(string employeeId, string missionId)
        {
            try
            {
                var dto = await _compensationService.GetByEmployeeIdAsync(employeeId, missionId);
                if (dto.Compensations == null || !dto.Compensations.Any())
                {
                    _logger.LogDebug("Aucune compensation trouvée pour EmployeeId={EmployeeId}, MissionId={MissionId}", employeeId, missionId);
                    return 0m;
                }

                var total = dto.Compensations.Sum(c =>
                    c.TransportAmount +
                    c.BreakfastAmount +
                    c.LunchAmount +
                    c.DinnerAmount +
                    c.AccommodationAmount +
                    c.CommunicationAmount +
                    c.VisaAmount +
                    c.MedicalExpensesAmount +
                    c.TaxesAmount
                );

                _logger.LogDebug("Total des compensations calculé: {Total} pour EmployeeId={EmployeeId}, MissionId={MissionId}", total, employeeId, missionId);
                return total;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du calcul du total des compensations pour EmployeeId={EmployeeId}, MissionId={MissionId}", employeeId, missionId);
                throw new Exception($"Erreur lors du calcul du total des compensations pour l'employé {employeeId} et la mission {missionId} : {ex.Message}", ex);
            }
        }
        

        private static MissionPaiementResult CombinePaiementResults(List<MissionPaiementResult> results)
        {
            if (results.Count == 1)
                return results[0];
            var combinedDailyPaiements = results.SelectMany(r => r.DailyPaiements).ToList();
     
            return new MissionPaiementResult
            {
                DailyPaiements = combinedDailyPaiements
            };
        }
 

        private async Task<(UserDto? validator, string validatorType)> GetHierarchicalValidatorAsync(string? employeeCode, string? missionCreatorUserId = null)
        {
            if (string.IsNullOrWhiteSpace(employeeCode))
            {
                return (null, string.Empty);
            }

            var userMatricule = await _userService.GetByMatriculeAsync(employeeCode);
            
            if (userMatricule == null || string.IsNullOrWhiteSpace(userMatricule.Department))
            {
                return (null, string.Empty);
            }

            var directeurFlow = await _validatorsFlowService.GetDirecteurTutelleAsync(userMatricule.Department,employeeCode);

            if (directeurFlow != null)
            {
                var userDto = new UserDto
                {
                    UserId = directeurFlow.UserId,
                    Department = directeurFlow.Department,
                    SuperiorId = directeurFlow.SuperiorId
                };
                
                return (userDto, "Directeur de tutelle");
            }

            return (null, string.Empty);
        }

        public async Task<MissionResultDTO?> VerifyMissionByNameAsync(string name)
        {
            try
            {
                _logger.LogInformation("Vérification de l'existence de la mission avec le nom: {Name}", name);
                var filters = new MissionSearchFiltersDTO { Name = name };
                var (result, _) = await _repository.SearchAsync(filters, 1, 1);
                return result.FirstOrDefault();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification de la mission avec le nom: {Name}", name);
                throw;
            }
        }

        public async Task<(IEnumerable<MissionResultDTO>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize)
        {
            try
            {
                _logger.LogInformation("Recherche des missions - page {Page}, taille {PageSize}", page, pageSize);
                return await _repository.SearchAsync(filters, page, pageSize);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche des missions");
                throw;
            }
        }

        public async Task<IEnumerable<Mission>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les missions");
                throw;
            }
        }

        public async Task<Mission?> GetByIdAsync(string id)
        {
            try
            {
                _logger.LogInformation("Récupération de la mission avec ID: {Id}", id);
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la mission avec ID: {Id}", id);
                throw;
            }
        }

        public async Task<Mission?> GetByIdAsync(string employeeId, string missionId)
        {
            try
            {
                _logger.LogInformation("Récupération de la mission avec EmployeeId: {EmployeeId}, MissionId: {MissionId}", employeeId, missionId);
                return await _repository.GetByIdAsync(employeeId, missionId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la mission avec EmployeeId: {EmployeeId}, MissionId: {MissionId}", employeeId, missionId);
                throw;
            }
        }

        public async Task<string> CreateAsync(MissionDTOForm? missionDto)
        {
            if (missionDto == null)
                throw new ArgumentNullException(nameof(missionDto));

            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                var missionId = _sequenceGenerator.GenerateSequence("seq_mission_id", "MIS", 6, "-");
                var mission = new Mission(missionDto) { MissionId = missionId };

                var employee = await _employeeService.GetByIdAsync(mission.EmployeeId);
                if (employee == null)
                    throw new InvalidOperationException($"Employé avec l'ID {mission.EmployeeId} introuvable.");

                mission.Employee = employee;

                await _repository.AddAsync(mission);
                await _repository.SaveChangesAsync();

                var missionPaiement = new MissionPaiement();
                var (totalAmount, dateDebut) = await missionPaiement.GenerateTotalPaiementAsync(mission, _compensationScaleService);

                if (totalAmount > 0)
                {
                    var prevision = new PrevisionPriceDtoForm
                    {
                        Amount = totalAmount,
                        DepartureDate = dateDebut,
                        IsPaid = 0,
                        MissionId = missionId,
                    };
                    await _previsionPriceService.AddAsync(prevision);
                }

                var recipientUserIds = new HashSet<string>();
                var (validator, validatorType) = await GetHierarchicalValidatorAsync(employee.EmployeeCode, missionDto.UserId);
                var drh = await _validatorsFlowService.GetDirecteurRHAsync();

                if (validator != null && !string.IsNullOrWhiteSpace(validator.UserId))
                {
                    var validationForm = new MissionValidationDTOForm
                    {
                        MissionId = missionId,
                        MissionCreator = missionDto.UserId,
                        Status = "pending",
                        ToWhom = validator.UserId,
                        Type = validatorType
                    };
                    await _validationService.CreateAsync(validationForm, missionDto.UserId);
                    recipientUserIds.Add(validator.UserId);

                    if (drh != null && !string.IsNullOrWhiteSpace(drh.UserId) && drh.UserId != validator.UserId)
                    {
                        var drhValidation = new MissionValidationDTOForm
                        {
                            MissionId = missionId,
                            MissionCreator = missionDto.UserId,
                            Status = null, 
                            ToWhom = drh.UserId,
                            Type = "DRH"
                        };
                        await _validationService.CreateAsync(drhValidation, missionDto.UserId);
                    }
                }
                else
                {
                    if (drh != null && !string.IsNullOrWhiteSpace(drh.UserId))
                    {
                        var drhValidation = new MissionValidationDTOForm
                        {
                            MissionId = missionId,
                            MissionCreator = missionDto.UserId,
                            Status = "pending", 
                            ToWhom = drh.UserId,
                            Type = "DRH"
                        };
                        await _validationService.CreateAsync(drhValidation, missionDto.UserId);
                        recipientUserIds.Add(drh.UserId);
                    }
                }

                var lieu = await _lieuService.GetByIdAsync(mission.LieuId);
                var user = await _userService.GetByIdAsync(missionDto.UserId);

                var notification = new NotificationFormDTO
                {
                    Title = $"Nouvelle mission créée par {user?.Name ?? "Inconnu"}",
                    Message = $"Mission '{mission.Name}' à {lieu?.Nom ?? "lieu inconnu"} du {mission.StartDate:yyyy-MM-dd} au {mission.EndDate:yyyy-MM-dd} en attente de validation.",
                    Type = "mission",
                    RelatedTable = "mission",
                    RelatedMenu = "collaborateur",
                    RelatedId = missionId,
                    Priority = 2,
                    UserIds = recipientUserIds.ToList(),
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationsService.CreateAsync(notification, transaction);

                var logData = new
                {
                    mission.Name,
                    mission.Description,
                    mission.StartDate,
                    mission.EndDate,
                    Lieu = lieu?.Nom,
                    MontantTotal = totalAmount
                };

                await _logService.LogAsync("INSERTION", "MISSION", null, logData, missionDto.UserId,
                    "Name,Description,StartDate,EndDate,Lieu,MontantTotal");

                await transaction.CommitAsync();
                return missionId;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id, MissionDTOForm? missionDto)
        {
            if (missionDto == null) throw new ArgumentNullException(nameof(missionDto));
            if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("ID requis", nameof(id));
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                var existing = await _context.Missions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(m => m.MissionId == id);

                if (existing == null)
                    throw new KeyNotFoundException($"Mission avec l'ID {id} non trouvée.");

                existing.MissionType     = missionDto.MissionType;
                existing.Name            = missionDto.Name;
                existing.Description     = missionDto.Description;
                existing.StartDate       = missionDto.StartDate;
                existing.EndDate         = missionDto.EndDate;
                existing.Status          = missionDto.Status;
                existing.DepartureDate   = missionDto.DepartureDate;
                existing.DepartureTime   = missionDto.DepartureTime;
                existing.ReturnDate      = missionDto.ReturnDate;
                existing.ReturnTime      = missionDto.ReturnTime;
                existing.Duration        = missionDto.Duration;
                existing.Type            = missionDto.Type;
                existing.AllocatedFund   = missionDto.AllocatedFund;
                existing.UpdatedAt       = DateTime.UtcNow;

                existing.EmployeeId  = missionDto.EmployeeId;
                existing.TransportId = missionDto.TransportId;
                existing.LieuId      = missionDto.LieuId;

                existing.Employee  = null!;
                existing.Transport = null!;
                existing.Lieu      = null!;

                _context.Missions.Update(existing);
                await _context.SaveChangesAsync();

                var notification = new NotificationFormDTO
                {
                    Title         = "Mission mise à jour",
                    Message       = $"La mission '{existing.Name}' a été modifiée.",
                    Type          = "mission",
                    RelatedTable  = "mission",
                    RelatedId     = id,
                    Priority      = 2,
                    UserIds       = new List<string> { missionDto.UserId },
                    CreatedAt     = DateTime.UtcNow
                };

                await _notificationsService.CreateAsync(notification, transaction);
                await transaction.CommitAsync();

                var updated = await _context.Missions
                    .AsNoTracking()
                    .FirstOrDefaultAsync(m => m.MissionId == id);
                
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur lors de la mise à jour de la mission {MissionId}", id);
                throw;
            }
        }
        public async Task<bool> DeleteAsync(string id, string userId)
        {
            try
            {
                var mission = await _repository.GetByIdAsync(id);
                if (mission == null) return false;

                await _repository.DeleteAsync(mission);
                await _repository.SaveChangesAsync();

                await _logService.LogAsync("SUPPRESSION", "MISSION", mission, null, userId, "MissionId,Name,StartDate,EndDate");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur suppression mission {Id}", id);
                throw;
            }
        }

        public async Task<bool> CancelAsync(string id, string userId)
        {
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                var mission = await _repository.GetByIdAsync(id);
                if (mission == null) return false;

                var oldStatus = mission.Status;
                mission.Status = MissionStatus.Canceled;
                await _repository.UpdateAsync(mission);
                await _repository.SaveChangesAsync();

                await _validationService.CancelValidationsByMissionIdAsync(id, userId);

                await _logService.LogStatusChangeAsync(
                    action: "ANNULATION",
                    tableName: "missions",
                    entity: mission,
                    propertyName: "Status",
                    oldValue: oldStatus,
                    newValue: "canceled",
                    userId: userId
                );
                
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Erreur annulation mission {Id}", id);
                throw;
            }
        }

        // Les autres méthodes restent inchangées
        public Task<MissionStats> GetStatisticsAsync(string[]? matricule = null) 
            => _repository.GetStatisticsAsync(matricule);

        public Task<int> GetOngoingMissionsCountAsync() 
            => _repository.GetOngoingMissionsCountAsync();

        public Task<int> GetPlannedMissionsThisMonthCountAsync() 
            => _repository.GetPlannedMissionsThisMonthCountAsync();

        public Task<(int count, DateTime date)> GetPlannedMissionsThisDateCountWithDateAsync() 
            => _repository.GetPlannedMissionsThisDateCountWithDateAsync();

        public async Task<(decimal progressRate, DateTime calculationDate)> GetProgressRateAsync()
        {
            var now = DateTime.UtcNow.Date;
            var missions = await GetAllAsync();
            var active = missions.Where(m => m.Status != MissionStatus.Canceled && m.Status != MissionStatus.Completed).ToList();

            if (!active.Any()) return (100m, now);

            decimal totalDuration = active.Sum(m => (decimal)(m.EndDate - m.StartDate).TotalDays + 1);
            if (totalDuration <= 0) return (0m, now);

            decimal earned = 0m;
            foreach (var m in active)
            {
                var start = m.StartDate.Date;
                var end = m.EndDate.Date;
                var duration = (decimal)(end - start).TotalDays + 1;

                decimal progress = now < start ? 0m :
                                   now > end ? 1m :
                                   (decimal)(now - start).TotalDays / duration;

                earned += progress * duration;
            }

            return ((earned / totalDuration) * 100m, now);
        }

        public Task<(decimal nationalRate, decimal internationalRate)> GetMissionTypesRateAsync() 
            => _repository.GetMissionTypesRateAsync();
    }

    public static class DecimalExtensions
    {
        public static string ToFormattedString(this decimal value)
        {
            return value.ToString("N0", CultureInfo.InvariantCulture).Replace(",", " ");
        }
    }
}