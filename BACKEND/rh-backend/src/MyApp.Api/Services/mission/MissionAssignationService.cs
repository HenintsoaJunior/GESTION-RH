using MyApp.Api.Entities.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;
using MyApp.Api.Services.employee;
using ClosedXML.Excel;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.lieu;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Utils.csv;
using MyApp.Api.Utils.exception;
using MyApp.Api.Utils.pdf;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using SpireDoc = Spire.Doc;
using System.IO;
using MyApp.Api.Services.mission;
namespace MyApp.Api.Services.mission
{
    public interface IMissionAssignationService
    {
        Task<List<string>?> ImportMissionFromCsv(Stream fileStream, char separator, MissionService missionService);
        Task<int> CalculateDuration(DateTime start, DateTime end);
        Task<byte[]> GeneratePdfReportAsync(GeneratePaiementDTO generatePaiementDto);
        Task<IEnumerable<Employee>> GetEmployeesNotAssignedToMissionAsync(string missionId);
        Task<IEnumerable<MissionAssignation>> GetAllAsync();
        Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId, string? transportId);
        Task<MissionAssignation?> GetByIdMissionAsync(string missionId);
        Task<MissionAssignation?> GetByAssignationIdAsync(string assignationId);
        Task<MissionAssignation?> GetByEmployeeIdMissionIdAsync(string employeeId, string missionId);
        Task<(IEnumerable<MissionAssignation>, int)> SearchAsync(MissionAssignationSearchFiltersDTO filters, int page, int pageSize);
        Task<(string EmployeeId, string MissionId, string assignationId, string? TransportId)> CreateAsync(MissionAssignation missionAssignation);
        Task<bool> UpdateAsync(string assignationId, MissionAssignation missionAssignation);
        Task<bool> DeleteAsync(string assignationId);
        Task<MissionPaiementResult> GeneratePaiementsAsync(string? employeeId = null, string? missionId = null);
        Task<ExpensePaiementResult> GenerateExpensePaiementsAsync(string? employeeId = null, string? missionId = null);
        Task<byte[]> GenerateExcelReportAsync(string? employeeId = null, string? missionId = null);
        Task<byte[]> GenerateMissionOrderPDFAsync(string employeeId, string missionId);
        Task<byte[]> GenerateATDPDFAsync(string employeeId);
        Task<IEnumerable<MissionAssignation>> GetAllByMissionIdAsync(string missionId);
        Task<byte[]> GenerateIMPDFAsync(string employeeId, string missionId);
    }
    public class MissionAssignationService : IMissionAssignationService
    {
        private readonly IMissionAssignationRepository _repository;
        private readonly IMissionRepository _missionRepository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ICompensationScaleService _compensationScaleService;
        private readonly IExpenseCompensationScaleService _expenseCompensationScaleService;
        private readonly IEmployeeService _employeeService;
        private readonly ICategoriesOfEmployeeService _categoriesOfEmployeeService;
        private readonly ILieuService _lieuService;
        private readonly ITransportService _transportService;
        private readonly ICompensationService _compensationService;
        private readonly ILogger<MissionAssignationService> _logger;
        private readonly ILoggerFactory _loggerFactory;
        public MissionAssignationService(
            IMissionAssignationRepository repository,
            IMissionRepository missionRepository,
            ISequenceGenerator sequenceGenerator,
            ICompensationScaleService compensationScaleService,
            IExpenseCompensationScaleService expenseCompensationScaleService,
            IEmployeeService employeeService,
            ICategoriesOfEmployeeService categoriesOfEmployeeService,
            ILieuService lieuService,
            ITransportService transportService,
            ICompensationService compensationService,
            ILogger<MissionAssignationService> logger,
            ILoggerFactory loggerFactory)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _missionRepository = missionRepository ?? throw new ArgumentNullException(nameof(missionRepository));
            _sequenceGenerator = sequenceGenerator ?? throw new ArgumentNullException(nameof(sequenceGenerator));
            _compensationScaleService = compensationScaleService ?? throw new ArgumentNullException(nameof(compensationScaleService));
            _expenseCompensationScaleService = expenseCompensationScaleService ?? throw new ArgumentNullException(nameof(expenseCompensationScaleService));
            _employeeService = employeeService ?? throw new ArgumentNullException(nameof(employeeService));
            _lieuService = lieuService ?? throw new ArgumentNullException(nameof(lieuService));
            _categoriesOfEmployeeService = categoriesOfEmployeeService ?? throw new ArgumentNullException(nameof(categoriesOfEmployeeService));
            _transportService = transportService ?? throw new ArgumentNullException(nameof(transportService));
            _compensationService = compensationService ?? throw new ArgumentNullException(nameof(compensationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _loggerFactory = loggerFactory ?? throw new ArgumentNullException(nameof(loggerFactory));
        }
     
        private static void ApplyCenturyGothicFont(Run run)
        {
            if (run.RunProperties == null)
            {
                run.RunProperties = new RunProperties();
            }
            var rFonts = new RunFonts()
            {
                Ascii = "Century Gothic",
                HighAnsi = "Century Gothic",
                ComplexScript = "Century Gothic",
                EastAsia = "Century Gothic"
            };
            run.RunProperties.AppendChild(rFonts);
        }
        public async Task<byte[]> GenerateIMPDFAsync(string employeeId, string missionId)
        {
            var missionAssignation = await _repository.GetByIdAsync(employeeId, missionId);
            if (missionAssignation == null)
            {
                throw new InvalidOperationException($"Mission assignation not found for EmployeeId: {employeeId}, MissionId: {missionId}");
            }
            var dto = await _compensationService.GetByEmployeeIdAsync(employeeId, missionId);
            if (dto.Compensations == null || !dto.Compensations.Any())
            {
                throw new InvalidOperationException("Aucune compensation trouvée pour cette assignation de mission.");
            }
            string templatePath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, @"..\..\..\File\IM.docx"));
            if (!File.Exists(templatePath))
            {
                throw new FileNotFoundException("Le fichier modèle n'existe pas.", templatePath);
            }
         
         
            string datePart = missionAssignation.DepartureDate.ToString("dd/MM/yyyy");
            TimeSpan? depTime = missionAssignation.DepartureTime;
            string timePart = depTime.HasValue ? $"{depTime.Value.Hours:D2}:{depTime.Value.Minutes:D2}" : "";
            string datePartReturn;
            if (missionAssignation.ReturnDate is IFormattable formattableReturn)
            {
                datePartReturn = formattableReturn.ToString("dd/MM/yyyy", null) ?? string.Empty;
            }
            else
            {
                datePartReturn = System.Convert.ToString(missionAssignation.ReturnDate) ?? string.Empty;
            }
            TimeSpan? depTimeReturn = missionAssignation.ReturnTime;
            string timePartReturn = depTimeReturn.HasValue ? $"{depTimeReturn.Value.Hours:D2}:{depTimeReturn.Value.Minutes:D2}" : "";
         
            // Déterminer le libellé transport pour missions internationales
            string transportStr = missionAssignation.Transport != null ? missionAssignation.Transport.Type ?? "" : "";
            if (string.IsNullOrEmpty(transportStr) && missionAssignation.Mission?.MissionType != "national")
            {
                transportStr = "N'importe quel moyen de transport";
            }
            var replacements = new Dictionary<string, string>
            {
                { "${ref}", missionAssignation.AssignationId ?? "" },
                { "${date}", DateTime.Now.ToString("dd/MM/yyyy") },
                { "${page}", "1" },
                { "${titre_mission}", missionAssignation.Mission?.Name ?? "" },
                { "${numero}",missionAssignation.AssignationId ?? "" },
                { "${nom}", missionAssignation.Employee?.LastName ?? "" },
                { "${prenom}", missionAssignation.Employee?.FirstName ?? "" },
                { "${base}", missionAssignation.Employee?.Site?.Code ?? "" },
                { "${categorie}", "C"+missionAssignation.Employee?.Category ?? "" },
                { "${fonction}", missionAssignation.Employee?.JobTitle ?? "" },
                { "${matricule}", missionAssignation.Employee?.EmployeeCode ?? "" },
                { "${direction}", missionAssignation.Employee?.Direction?.DirectionName ?? "" },
                { "${departement}", missionAssignation.Employee?.Department?.DepartmentName ?? "" },
                { "${service}", missionAssignation.Employee?.Service?.ServiceName?? "" },
                { "${lieu}", missionAssignation.Mission?.Lieu?.Nom ?? "" },
                { "${motif}", missionAssignation.Mission?.Description ?? "" },
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
                        // Supprimer le run contenant le placeholder
                        runToRemove.Remove();
                        // Déterminer si la mission est internationale
                        bool isInternational = missionAssignation.Mission?.MissionType != "national";
                        // Créer le tableau
                        var table = new Table();
                        var tableProperties = new TableProperties();
                        tableProperties.Append(new TableStyle() { Val = "TableGrid" });
                        table.AppendChild(tableProperties);
                        // Configuration conditionnelle des colonnes
                        string[] headers;
                        string[] widths;
                        if (isInternational)
                        {
                            headers = new[] { "Date", "Transport", "Petit Déjeuner", "Déjeuner", "Dinner", "Hébergement", "Communication", "Visa sur place", "Frais médicaux", "Taxes", "Montant Total" };
                            widths = new[] { "1200", "1200", "1200", "1200", "1200", "1200", "1200", "1200", "1200", "1200", "1500" };
                        }
                        else
                        {
                            headers = new[] { "Date", "Transport", "Petit Déjeuner", "Déjeuner", "Dinner", "Hébergement", "Montant Total" };
                            widths = new[] { "1500", "1500", "1500", "1500", "1500", "1500", "2000" };
                        }
                        // Ligne d'en-tête
                        var headerRow = new TableRow();
                        for (int i = 0; i < headers.Length; i++)
                        {
                            var headerCell = new TableCell(new Paragraph(new Run(new Text(headers[i]))));
                            ApplyCenturyGothicFont(headerCell.Descendants<Run>().First());
                            var cellProperties = new TableCellProperties(new TableCellWidth() { Type = TableWidthUnitValues.Dxa, Width = widths[i] });
                            // Ajouter des bordures solides à chaque cellule
                            var borders = new TableCellBorders(
                                new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" }
                            );
                            cellProperties.Append(borders);
                            headerCell.Append(cellProperties);
                            headerRow.Append(headerCell);
                        }
                        // Ajouter les propriétés pour répéter l'en-tête sur les nouvelles pages
                        var headerRowProperties = new TableRowProperties(new TableHeader());
                        headerRow.PrependChild(headerRowProperties);
                        table.Append(headerRow);
                        // Lignes de données
                        foreach (var comp in dto.Compensations.OrderBy(c => c.PaymentDate))
                        {
                            var totalRowAmount = comp.TransportAmount + comp.BreakfastAmount + comp.LunchAmount + comp.DinnerAmount + comp.AccommodationAmount;
                            if (isInternational)
                            {
                                totalRowAmount += comp.CommunicationAmount + comp.VisaAmount + comp.MedicalExpensesAmount + comp.TaxesAmount;
                            }
                            string[] values;
                            if (isInternational)
                            {
                                values = new[] {
                                    comp.PaymentDate?.ToString("dd/MM/yyyy") ?? "",
                                    $"{comp.TransportAmount:F2}",
                                    $"{comp.BreakfastAmount:F2}",
                                    $"{comp.LunchAmount:F2}",
                                    $"{comp.DinnerAmount:F2}",
                                    $"{comp.AccommodationAmount:F2}",
                                    $"{comp.CommunicationAmount:F2}",
                                    $"{comp.VisaAmount:F2}",
                                    $"{comp.MedicalExpensesAmount:F2}",
                                    $"{comp.TaxesAmount:F2}",
                                    $"{totalRowAmount:F2}"
                                };
                            }
                            else
                            {
                                values = new[] {
                                    comp.PaymentDate?.ToString("dd/MM/yyyy") ?? "",
                                    $"{comp.TransportAmount:F2}",
                                    $"{comp.BreakfastAmount:F2}",
                                    $"{comp.LunchAmount:F2}",
                                    $"{comp.DinnerAmount:F2}",
                                    $"{comp.AccommodationAmount:F2}",
                                    $"{totalRowAmount:F2}"
                                };
                            }
                            var dataRow = new TableRow();
                            for (int i = 0; i < values.Length; i++)
                            {
                                var dataCell = new TableCell(new Paragraph(new Run(new Text(values[i]))));
                                ApplyCenturyGothicFont(dataCell.Descendants<Run>().First());
                                var cellProperties = new TableCellProperties(new TableCellWidth() { Type = TableWidthUnitValues.Dxa, Width = widths[i] });
                                // Ajouter des bordures solides à chaque cellule
                                var borders = new TableCellBorders(
                                    new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" }
                                );
                                cellProperties.Append(borders);
                                dataCell.Append(cellProperties);
                                dataRow.Append(dataCell);
                            }
                            table.Append(dataRow);
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
                                $"{totalTransport:F2}",
                                $"{totalPetitDej:F2}",
                                $"{totalDejeuner:F2}",
                                $"{totalDiner:F2}",
                                $"{totalHebergement:F2}",
                                $"{totalCommunication:F2}",
                                $"{totalVisa:F2}",
                                $"{totalMedicaux:F2}",
                                $"{totalTaxes:F2}",
                                $"{grandTotal:F2}"
                            };
                            var totalRow = new TableRow();
                            for (int i = 0; i < totalValues.Length; i++)
                            {
                                var totalCell = new TableCell(new Paragraph(new Run(new Text(totalValues[i]))));
                                ApplyCenturyGothicFont(totalCell.Descendants<Run>().First());
                                var cellProperties = new TableCellProperties(new TableCellWidth() { Type = TableWidthUnitValues.Dxa, Width = widths[i] });
                                // Ajouter des bordures solides à chaque cellule
                                var borders = new TableCellBorders(
                                    new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" }
                                );
                                cellProperties.Append(borders);
                                totalCell.Append(cellProperties);
                                if (i == 0 || i == totalValues.Length - 1)
                                {
                                    // Bold for Total label and grand total
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
                                $"{totalTransport:F2}",
                                $"{totalPetitDej:F2}",
                                $"{totalDejeuner:F2}",
                                $"{totalDiner:F2}",
                                $"{totalHebergement:F2}",
                                $"{grandTotal:F2}"
                            };
                            var totalRow = new TableRow();
                            for (int i = 0; i < totalValues.Length; i++)
                            {
                                var totalCell = new TableCell(new Paragraph(new Run(new Text(totalValues[i]))));
                                ApplyCenturyGothicFont(totalCell.Descendants<Run>().First());
                                var cellProperties = new TableCellProperties(new TableCellWidth() { Type = TableWidthUnitValues.Dxa, Width = widths[i] });
                                // Ajouter des bordures solides à chaque cellule
                                var borders = new TableCellBorders(
                                    new TopBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new LeftBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new BottomBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new RightBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideHorizontalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" },
                                    new InsideVerticalBorder() { Val = new EnumValue<BorderValues>(BorderValues.Single), Size = 6, Color = "000000" }
                                );
                                cellProperties.Append(borders);
                                totalCell.Append(cellProperties);
                                if (i == 0 || i == totalValues.Length - 1)
                                {
                                    // Bold for Total label and grand total
                                    var run = totalCell.Descendants<Run>().First();
                                    run.RunProperties ??= new RunProperties();
                                    run.RunProperties.Append(new Bold());
                                }
                                totalRow.Append(totalCell);
                            }
                            table.Append(totalRow);
                        }
                        // Insérer le tableau après le paragraphe cible
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
        public async Task<IEnumerable<MissionAssignation>> GetAllByMissionIdAsync(string missionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(missionId))
                    throw new ArgumentException("L'ID de la mission ne peut pas être vide.", nameof(missionId));
                var entities = await _repository.GetAllByMissionIdAsync(missionId);
                var results = entities.Select(CreateMissionAssignationFromEntity).ToList();
                _logger.LogDebug("Récupéré {Count} assignations pour la mission {MissionId}", results.Count, missionId);
                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des assignations pour la mission {MissionId}", missionId);
                throw new Exception($"Erreur lors de la récupération des assignations de mission {missionId} : {ex.Message}", ex);
            }
        }
        public async Task<byte[]> GenerateMissionOrderPDFAsync(string employeeId, string missionId)
        {
            var missionAssignation = await _repository.GetByIdAsync(employeeId, missionId);
            if (missionAssignation == null)
            {
                throw new InvalidOperationException($"Mission assignation not found for EmployeeId: {employeeId}, MissionId: {missionId}");
            }
            string templatePath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, @"..\..\..\File\OM.docx"));
            if (!File.Exists(templatePath))
            {
                throw new FileNotFoundException("Le fichier modèle n'existe pas.", templatePath);
            }
            var replacements = new Dictionary<string, string>
            {
                { "${ref}", missionAssignation.AssignationId ?? "" },
                { "${date}", DateTime.Now.ToString("dd/MM/yyyy") },
                { "${page}", "1" },
                { "${titre_mission}", missionAssignation.Mission?.Name ?? "" },
                { "${numero}",missionAssignation.AssignationId ?? "" },
                { "${nom}", missionAssignation.Employee?.LastName ?? "" },
                { "${prenom}", missionAssignation.Employee?.FirstName ?? "" },
                { "${fonction}", missionAssignation.Employee?.JobTitle ?? "" },
                { "${matricule}", missionAssignation.Employee?.EmployeeCode ?? "" },
                { "${direction}", missionAssignation.Employee?.Direction?.DirectionName ?? "" },
                { "${departement}", missionAssignation.Employee?.Department?.DepartmentName ?? "" },
                { "${service}", missionAssignation.Employee?.Service?.ServiceName?? "" },
                { "${lieu}", missionAssignation.Mission?.Lieu?.Nom ?? "" },
                { "${motif}", missionAssignation.Mission?.Description ?? "" },
                { "${transport}", missionAssignation.Transport != null ? missionAssignation.Transport.Type ?? "" : "" },
                { "${date_heure_depart}", $"{missionAssignation.DepartureDate:dd/MM/yyyy} {missionAssignation.DepartureTime?.ToString(@"hh\:mm") ?? ""}" },
                { "${date_heure_retour}", $"{missionAssignation.ReturnDate:dd/MM/yyyy} {missionAssignation.ReturnTime?.ToString(@"hh\:mm") ?? ""}" }
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
     
            string templatePath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, @"..\..\..\File\ATD.docx"));
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
     
        public async Task<List<string>?> ImportMissionFromCsv(Stream fileStream, char separator, MissionService missionService)
        {
            var errors = new List<string>();
            await using var transaction = await _repository.BeginTransactionAsync();
            try
            {
                var data = CSVReader.ReadCsv(fileStream, separator);
                // check les erreurs
                errors.AddRange(await ValidateDataAsync(data));
                // si employee n'existe pas => throws
                var employee = await _employeeService.VerifyEmployeeExistsAsync(data[1][0]);
                // si lieu n'existe pas => insertion lieu
                var lieu = await GetOrCreateLieuAsync(data[1][7]);
                // si mission n'existe pas => insertion mission
                var mission = await GetOrCreateMissionAsync(data, lieu.LieuId, missionService);
                // si transport n'existe pas => throws
                var transport = await _transportService.VerifyTransportByTypeAsync(data[1][10]);
                // si mission assignation n'existe pas => insertion
                if (transport != null) await CreateMissionAssignationIfNotExists(data, employee.EmployeeId, mission, transport.TransportId);
                if (transport == null) await CreateMissionAssignationIfNotExists(data, employee.EmployeeId, mission, null);
                await transaction.CommitAsync();
                return errors;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new Exception($"Exception durant l'import: {ex.Message}", ex);
            }
        }
        private async Task CreateMissionAssignationIfNotExists( List<List<string>> data, string employeeId, Mission mission, string? transportId)
        {
            var existing = await VerifyMissionAssignationByNameAsync(employeeId, mission.MissionId);
            if (existing != null) throw new Exception($"Mission déjà importé");
            var assignation = new MissionAssignation(new MissionAssignationDTOForm
            {
                EmployeeId = employeeId,
                MissionId = mission.MissionId,
                TransportId = transportId,
                DepartureDate = mission.StartDate,
                DepartureTime = TimeSpan.TryParse(data[1][6], out var depTime) ? depTime : (TimeSpan?)null,
                ReturnDate = mission.EndDate,
                ReturnTime = TimeSpan.TryParse(data[1][8], out var retTime) ? retTime : (TimeSpan?)null,
                Duration = await CalculateDuration(
                mission.StartDate,
                mission.EndDate)
            });
            await CreateAsync(assignation);
        }
        private static async Task<Mission> GetOrCreateMissionAsync(List<List<string>> data, string lieuId, MissionService missionService)
        {
            var missionName = data[1][4];
            var startDate = DateTime.Parse(data[1][9]);
            var endDate = DateTime.Parse(data.Last()[9]);
            var mission = await missionService.VerifyMissionByNameAsync(missionName);
            return mission ?? new Mission
            {
                MissionId = await missionService.CreateAsync(new MissionDTOForm
                {
                    Name = missionName,
                    StartDate = startDate,
                    EndDate = endDate,
                    LieuId = lieuId
                }),
                StartDate = startDate,
                EndDate = endDate,
                LieuId = lieuId
            };
        }
        private async Task<Lieu> GetOrCreateLieuAsync(string lieuData)
        {
            var parts = lieuData.Split("/");
            var nom = parts[0];
            var pays = parts.Length == 2 ? parts[1] : null;
            var lieu = await _lieuService.VerifyLieuExistsAsync(nom, pays);
            return lieu ?? new Lieu
            {
                LieuId = await _lieuService.CreateAsync(new LieuDTOForm { Nom = nom, Pays = pays ?? string.Empty }),
                Nom = nom,
                Pays = pays ?? string.Empty
            };
        }
        private async Task<List<string>> ValidateDataAsync(List<List<string>> data)
        {
            var errors = new List<string>();
            var employeeErrors = await _employeeService.CheckNameAndCode(data);
            if (employeeErrors != null) errors.AddRange(employeeErrors);
            // var dateErrors = CSVReader.CheckDate(data);
            // if (dateErrors != null) errors.AddRange(dateErrors);
            //
            // var hourErrors = CSVReader.CheckHour(data);
            // if (hourErrors != null) errors.AddRange(hourErrors);
            return errors;
        }
        private async Task<MissionAssignation?> VerifyMissionAssignationByNameAsync(string employeeId, string missionId)
        {
            var filters = new MissionAssignationSearchFiltersDTO
            {
                EmployeeId = employeeId,
                MissionId = missionId
            };
            var (result, total) = await _repository.SearchAsync(filters, 1, 1);
            return result.FirstOrDefault();
        }
        public Task<int> CalculateDuration(DateTime start, DateTime end)
        {
            if (end < start)
                throw new ArgumentException("La date de fin ne peut pas être antérieure à la date de début.");
            TimeSpan duration = end.Date - start.Date;
            return Task.FromResult(duration.Days);
        }
     
        public async Task<byte[]> GeneratePdfReportAsync(GeneratePaiementDTO generatePaiementDto)
        {
            try
            {
                var paiements = await GeneratePaiementsAsync(
                    generatePaiementDto.EmployeeId,
                    generatePaiementDto.MissionId
                );
                var pdf = new PdfGenerator(paiements.GetDescriptionForPdf(), paiements.GetTablesForPdf());
                return pdf.GenerateMissionPaiementPdf("Indemnité de mission");
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération du PDF: {ex.Message}", ex);
            }
        }
        public async Task<ExpensePaiementResult> GenerateExpensePaiementsAsync(string? employeeId = null, string? missionId = null)
        {
            try
            {
                var missionAssignations = await _repository.GetFilteredAssignationsAsync(employeeId, missionId);
                var assignations = missionAssignations as MissionAssignation[] ?? missionAssignations.ToArray();
                if (assignations.Length == 0)
                {
                    return new ExpensePaiementResult
                    {
                        DailyPaiements = new List<DailyExpensePaiement>(),
                        MissionAssignation = null,
                        TransportAmount = 0m
                    };
                }
                var paiementResults = new List<ExpensePaiementResult>();
                foreach (var missionAssignation in assignations)
                {
                    var paiementResult = await GenerateExpensePaymentsForAssignation(missionAssignation);
                    paiementResults.Add(paiementResult);
                    LogExpensePaymentGenerationResult(paiementResult, missionAssignation.EmployeeId, missionAssignation.MissionId);
                    await CreateExpenseCompensationsForResultAsync(paiementResult, missionAssignation);
                }
                return CombineExpensePaiementResults(paiementResults);
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération des paiements des frais : {ex.Message}", ex);
            }
        }
        private async Task<ExpensePaiementResult> GenerateExpensePaymentsForAssignation(MissionAssignation missionAssignation)
        {
            var expensePaiement = new ExpensePaiement();
            var result = await expensePaiement.GeneratePaiement(missionAssignation, _expenseCompensationScaleService);
            // Pour les missions internationales, s'assurer que le transport est toujours généré
            var lieu = missionAssignation.Mission?.Lieu;
            if (lieu != null && lieu.Pays != "Madagascar" && result.TransportAmount == 0m)
            {
                // Récupérer le montant de transport basé sur la zone (assumez une méthode pour obtenir zoneId et montant)
                // Exemple : string zoneId = await GetZoneIdForLieuAsync(lieu.LieuId); // À implémenter si nécessaire
                // decimal transportScale = await _expenseCompensationScaleService.GetTransportScaleForZone(zoneId);
                // result.TransportAmount = transportScale; // Ou += si déjà présent
                // Note: Si GeneratePaiement fetch déjà les scales avec expense_type_id NULL et is_transport=1, cela est redondant.
                // Ajustez selon l'implémentation de ExpensePaiement.
            }
            return result;
        }
        private static void LogExpensePaymentGenerationResult(ExpensePaiementResult paiementResult, string employeeId, string missionId)
        {
            // Méthode conservée pour compatibilité mais sans logs
        }
        private static ExpensePaiementResult CombineExpensePaiementResults(List<ExpensePaiementResult> results)
        {
            if (results.Count == 1)
                return results[0];
            var combinedDailyPaiements = results.SelectMany(r => r.DailyPaiements).ToList();
            var totalTransport = results.Sum(r => r.TransportAmount);
         
            return new ExpensePaiementResult
            {
                DailyPaiements = combinedDailyPaiements,
                TransportAmount = totalTransport
            };
        }
        private async Task CreateExpenseCompensationsForResultAsync(ExpensePaiementResult paiementResult, MissionAssignation missionAssignation)
        {
            if (paiementResult.DailyPaiements == null || !paiementResult.DailyPaiements.Any())
            {
                return;
            }
            var isInternational = missionAssignation.Mission?.MissionType != "national";
            var dailyPaiements = paiementResult.DailyPaiements.OrderBy(d => d.Date).ToList();
            var firstDate = dailyPaiements.FirstOrDefault()?.Date;
            if (firstDate == null) return;
            var numberOfDays = dailyPaiements.Count;
            decimal totalCommunication = dailyPaiements.Sum(d => CalculateExpenseAmountExpense(d.CompensationScales?.ToList() ?? new List<ExpenseCompensationScale>(), "Communication"));
            decimal totalVisa = dailyPaiements.Sum(d => CalculateExpenseAmountExpense(d.CompensationScales?.ToList() ?? new List<ExpenseCompensationScale>(), "Visa sur place"));
            decimal totalMedical = dailyPaiements.Sum(d => CalculateExpenseAmountExpense(d.CompensationScales?.ToList() ?? new List<ExpenseCompensationScale>(), "Frais médicaux"));
          
            foreach (var dailyPaiement in dailyPaiements)
            {
                var compensationDto = new CompensationDTO
                {
                    AssignationId = missionAssignation.AssignationId,
                    EmployeeId = missionAssignation.EmployeeId,
                    PaymentDate = dailyPaiement.Date,
                    Devise = "EUR",
                    Status = "unpaid",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = null,
                    TransportAmount = 0m,
                    BreakfastAmount = 0m,
                    LunchAmount = 0m,
                    DinnerAmount = 0m,
                    AccommodationAmount = 0m,
                    CommunicationAmount = 0m,
                    VisaAmount = 0m,
                    MedicalExpensesAmount = 0m,
                    TaxesAmount = 0m
                };
                // Add all amounts from this day's scales (regular + daily specials like Transport/Taxes)
                if (dailyPaiement.CompensationScales != null)
                {
                    foreach (var cs in dailyPaiement.CompensationScales)
                    {
                        if (cs?.ExpenseType?.Type == null) continue;
                        var amount = cs.Amount;
                        var type = cs.ExpenseType.Type;
                        // Skip only one-time specials, handle them manually below
                        if (type == "Communication" || type == "Visa sur place" || type == "Frais médicaux")
                        {
                            continue;
                        }
                        switch (type)
                        {
                            case "Transport":
                                compensationDto.TransportAmount += amount;
                                break;
                            case "Petit Déjeuner":
                                compensationDto.BreakfastAmount += amount;
                                break;
                            case "Déjeuner":
                                compensationDto.LunchAmount += amount;
                                break;
                            case "Dinner":
                                compensationDto.DinnerAmount += amount;
                                break;
                            case "Hébergement":
                                compensationDto.AccommodationAmount += amount;
                                break;
                            case "Taxes":
                                compensationDto.TaxesAmount += amount;
                                break;
                        }
                    }
                }
                // Set one-time amounts on first date only (Communication, Visa, Medical)
                if (dailyPaiement.Date?.Date == firstDate.Value.Date)
                {
                    compensationDto.CommunicationAmount = totalCommunication;
                    compensationDto.VisaAmount = totalVisa;
                    compensationDto.MedicalExpensesAmount = totalMedical;
                }
                try
                {
                    var compensationId = await _compensationService.CreateAsync(compensationDto);
                    _logger.LogInformation("Compensation {CompensationId} créée pour la date {Date} de l'assignation {MissionId}", compensationId, dailyPaiement.Date, missionAssignation.MissionId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erreur lors de la création de la compensation pour la date {Date} de l'assignation {MissionId}", dailyPaiement.Date, missionAssignation.MissionId);
                }
            }
        }
        public async Task<MissionPaiementResult> GeneratePaiementsAsync(string? employeeId = null, string? missionId = null)
        {
            try
            {
                var missionAssignations = await _repository.GetFilteredAssignationsAsync(employeeId, missionId);
                var assignations = missionAssignations as MissionAssignation[] ?? missionAssignations.ToArray();
                if (assignations.Length == 0)
                {
                    return new MissionPaiementResult
                    {
                        DailyPaiements = new List<DailyPaiement>(),
                        MissionAssignation = null
                    };
                }
                var paiementResults = new List<MissionPaiementResult>();
                foreach (var missionAssignation in assignations)
                {
                    var paiementResult = await GeneratePaymentsForAssignation(missionAssignation);
                    paiementResults.Add(paiementResult);
                    LogPaymentGenerationResult(paiementResult, missionAssignation.EmployeeId, missionAssignation.MissionId);
                    await CreateCompensationsForResultAsync(paiementResult, missionAssignation);
                }
                return CombinePaiementResults(paiementResults);
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération des paiements : {ex.Message}", ex);
            }
        }
        private async Task CreateCompensationsForResultAsync(MissionPaiementResult paiementResult, MissionAssignation missionAssignation)
        {
            if (paiementResult.DailyPaiements == null || !paiementResult.DailyPaiements.Any())
            {
                return;
            }
            foreach (var dailyPaiement in paiementResult.DailyPaiements)
            {
                var compensationDto = new CompensationDTO
                {
                    AssignationId = missionAssignation.AssignationId,
                    EmployeeId = missionAssignation.EmployeeId,
                    PaymentDate = dailyPaiement.Date,
                    Devise = "MGA",
                    Status = "unpaid",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = null,
                    TransportAmount = CalculateTransportAmount(dailyPaiement.CompensationScales?.ToList() ?? new List<CompensationScale>(), missionAssignation.TransportId),
                    BreakfastAmount = 0m,
                    LunchAmount = 0m,
                    DinnerAmount = 0m,
                    AccommodationAmount = 0m,
                    CommunicationAmount = 0m, // Ajout pour compatibilité internationale si nécessaire
                    VisaAmount = 0m,
                    MedicalExpensesAmount = 0m,
                    TaxesAmount = 0m
                };
                if (dailyPaiement.CompensationScales != null)
                {
                    foreach (var cs in dailyPaiement.CompensationScales)
                    {
                        if (cs?.ExpenseType?.Type == null) continue;
                        var amount = cs.Amount;
                        switch (cs.ExpenseType.Type)
                        {
                            case "Petit Déjeuner":
                                compensationDto.BreakfastAmount += amount;
                                break;
                            case "Déjeuner":
                                compensationDto.LunchAmount += amount;
                                break;
                            case "Dinner":
                                compensationDto.DinnerAmount += amount;
                                break;
                            case "Hébergement":
                                compensationDto.AccommodationAmount += amount;
                                break;
                            // Les nouveaux types ne s'appliquent pas aux paiements nationaux, mais ajoutés pour cohérence
                            case "Communication":
                                compensationDto.CommunicationAmount += amount;
                                break;
                            case "Visa sur place":
                                compensationDto.VisaAmount += amount;
                                break;
                            case "Frais médicaux":
                                compensationDto.MedicalExpensesAmount += amount;
                                break;
                            case "Taxes":
                                compensationDto.TaxesAmount += amount;
                                break;
                        }
                    }
                }
                try
                {
                    var compensationId = await _compensationService.CreateAsync(compensationDto);
                    _logger.LogInformation("Compensation {CompensationId} créée pour la date {Date} de l'assignation {MissionId}", compensationId, dailyPaiement.Date, missionAssignation.MissionId);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Erreur lors de la création de la compensation pour la date {Date} de l'assignation {MissionId}", dailyPaiement.Date, missionAssignation.MissionId);
                }
            }
        }
        private async Task<MissionAssignation> GetMissionAssignationAsync(string employeeId, string missionId)
        {
            var missionAssignation = await GetByEmployeeIdMissionIdAsync(employeeId, missionId);
            return missionAssignation ?? throw new InvalidOperationException($"Mission assignation not found for EmployeeId: {employeeId}, MissionId: {missionId}");
        }
        private async Task<MissionPaiementResult> GeneratePaymentsForAssignation(MissionAssignation missionAssignation)
        {
            var missionPaiement = new MissionPaiement();
            return await missionPaiement.GeneratePaiement(missionAssignation, _compensationScaleService);
        }
        private static void LogPaymentGenerationResult(MissionPaiementResult paiementResult, string employeeId, string missionId)
        {
            // Méthode conservée pour compatibilité mais sans logs
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
        public async Task<byte[]> GenerateExcelReportAsync(string? employeeId = null, string? missionId = null)
        {
            try
            {
                var missionAssignations = await _repository.GetFilteredAssignationsAsync(employeeId, missionId);
                var allCompensations = new List<Compensation>();
                foreach (var assignment in missionAssignations)
                {
                    try
                    {
                        var dto = await _compensationService.GetByEmployeeIdAsync(assignment.EmployeeId, assignment.MissionId);
                        allCompensations.AddRange(dto.Compensations);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Erreur lors de la récupération des compensations pour EmployeeId={EmployeeId}, MissionId={MissionId}",
                            assignment.EmployeeId, assignment.MissionId);
                        continue;
                    }
                }
                var compensations = allCompensations.OrderBy(c => c.PaymentDate).ToList();
                if (!compensations.Any())
                {
                    return CreateEmptyExcelReport();
                }
                using var workbook = new XLWorkbook();
                var worksheet = workbook.Worksheets.Add("Mission Payment Report");
                CreateExcelHeaders(worksheet);
                var currentRow = 2;
             
                foreach (var compensation in compensations)
                {
                    WriteCompensationRowToWorksheet(worksheet, compensation, currentRow);
                    currentRow++;
                }
                if (currentRow == 2)
                {
                    worksheet.Cell(2, 1).Value = "Aucune donnée de compensation trouvée pour les affectations filtrées";
                    worksheet.Range("A2:O2").Merge(); // Ajusté pour plus de colonnes
                }
                worksheet.Range(2, 7, currentRow - 1, 15).Style.NumberFormat.Format = "#,##0"; // Ajusté pour nouvelles colonnes
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
        private static void WriteCompensationRowToWorksheet(IXLWorksheet worksheet, Compensation compensation, int row)
        {
            var employee = compensation.Employee;
            var assignation = compensation.Assignation;
            var mission = assignation!.Mission;
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
            worksheet.Cell(row, 12).Value = compensation.CommunicationAmount; // Nouveau
            worksheet.Cell(row, 13).Value = compensation.VisaAmount; // Nouveau
            worksheet.Cell(row, 14).Value = compensation.MedicalExpensesAmount; // Nouveau
            worksheet.Cell(row, 15).Value = compensation.TaxesAmount; // Nouveau
        }
        private byte[] CreateEmptyExcelReport()
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Mission Payment Report");
         
            CreateExcelHeaders(worksheet);
         
            worksheet.Cell(2, 1).Value = "Aucune affectation trouvée pour les critères spécifiés";
            worksheet.Range("A2:O2").Merge(); // Ajusté
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
            var headerRange = worksheet.Range($"A{tableStartRow}:O{tableStartRow}"); // Ajusté
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
        public async Task<(string EmployeeId, string MissionId, string assignationId, string? TransportId)> CreateAsync(MissionAssignation missionAssignation)
        {
            // Validation des paramètres d'entrée
            ArgumentNullException.ThrowIfNull(missionAssignation);
            if (string.IsNullOrWhiteSpace(missionAssignation.EmployeeId))
                throw new ArgumentException("L'ID de l'employé ne peut pas être vide.", nameof(missionAssignation.EmployeeId));
         
            if (string.IsNullOrWhiteSpace(missionAssignation.MissionId))
                throw new ArgumentException("L'ID de la mission ne peut pas être vide.", nameof(missionAssignation.MissionId));
            try
            {
                // Vérifier si l'assignation existe déjà
                var existingAssignation = await _repository.GetByIdAsync(
                    missionAssignation.EmployeeId,
                    missionAssignation.MissionId,
                    missionAssignation.TransportId);
                if (existingAssignation != null)
                {
                    throw new CustomException(
                        $"Une assignation existe déjà pour l'employé {missionAssignation.EmployeeId} et la mission {missionAssignation.MissionId}.");
                }
                // Générer l'ID d'assignation
                var assignationId = _sequenceGenerator.GenerateSequence("seq_assignation_id", "MA", 6, "-");
                missionAssignation.AssignationId = assignationId;
             
                // Définir les timestamps de création
                SetCreationTimestamps(missionAssignation);
             
                // Sauvegarder l'assignation
                await SaveMissionAssignationAsync(missionAssignation);
             
                // Mettre à jour le statut de la mission
                await UpdateMissionStatusAsync(missionAssignation.MissionId);
                _logger.LogInformation("Assignation créée avec succès pour EmployeeId={EmployeeId}, MissionId={MissionId}, AssignationId={AssignationId}",
                    missionAssignation.EmployeeId, missionAssignation.MissionId, missionAssignation.AssignationId);
                return (missionAssignation.EmployeeId, missionAssignation.MissionId, missionAssignation.AssignationId, missionAssignation.TransportId);
            }
            catch (DbUpdateException ex) when (ex.InnerException is SqlException sqlEx && (sqlEx.Number == 2601 || sqlEx.Number == 2627))
            {
                _logger.LogError(ex, "Erreur de contrainte d'unicité lors de la création de l'assignation pour EmployeeId={EmployeeId}, MissionId={MissionId}, TransportId={TransportId}",
                    missionAssignation.EmployeeId, missionAssignation.MissionId, missionAssignation.TransportId ?? "null");
             
                throw new CustomException(
                    $"Une assignation avec l'employé {missionAssignation.EmployeeId} et la mission {missionAssignation.MissionId} existe déjà. Veuillez vérifier les données saisies.",
                    ex);
            }
            catch (CustomException)
            {
                // Re-lancer les exceptions métier sans les encapsuler
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur inattendue lors de la création de l'assignation pour EmployeeId={EmployeeId}, MissionId={MissionId}",
                    missionAssignation.EmployeeId, missionAssignation.MissionId);
             
                throw new CustomException(
                    "Une erreur s'est produite lors de la création de l'assignation de mission. Veuillez réessayer ou contacter le support.",
                    ex);
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
            var mission = await _missionRepository.GetByIdAsync(missionId);
            if (mission != null)
            {
                mission.Status = "pending approval";
                mission.UpdatedAt = DateTime.UtcNow;
                await _missionRepository.UpdateAsync(mission);
                await _missionRepository.SaveChangesAsync();
            }
        }
        public async Task<bool> UpdateAsync(string assignationId, MissionAssignation missionAssignation)
        {
            try
            {
                var existing = await _repository.GetByAssignationIdAsync(assignationId);
                if (existing == null) return false;
                UpdateAssignationFields(existing, missionAssignation);
                await SaveUpdatedAssignationAsync(existing);
                _logger.LogInformation("Assignation mise à jour avec succès pour AssignationId: {AssignationId}", assignationId);
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
            existing.EmployeeId = updated.EmployeeId;
            existing.MissionId = updated.MissionId;
            existing.Type = updated.Type;
            existing.TransportId = updated.TransportId;
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
        public async Task<bool> DeleteAsync(string assignationId)
        {
            try
            {
                var existing = await _repository.GetByAssignationIdAsync(assignationId);
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
            var mission = await _missionRepository.GetByIdAsync(missionId);
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
        public async Task<MissionAssignation?> GetByIdMissionAsync(string missionId)
        {
            try
            {
                var missionAssignation = await _repository.GetByIdMissionAsync(missionId);
                return missionAssignation;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving mission assignation: {ex.Message}", ex);
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
        public async Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId)
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
     
        public async Task<MissionAssignation?> GetByAssignationIdAsync(string assignationId)
        {
            try
            {
                return await _repository.GetByAssignationIdAsync(assignationId);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving mission assignation : {ex.Message}", ex);
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
                AssignationId = entity.AssignationId,
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
                Transport = entity.Transport,
                Type = entity.Type
            };
        }
        public static decimal CalculateExpenseAmount(List<CompensationScale> compensationScales, string expenseType)
        {
            return compensationScales
                .Where(scale => scale.ExpenseType?.Type == expenseType)
                .Sum(scale => scale.Amount);
        }
        public static decimal CalculateTransportAmount(List<CompensationScale> compensationScales, string? transportId)
        {
            return compensationScales
                .Where(scale => scale.TransportId == transportId && scale.TransportId != null)
                .Sum(scale => scale.Amount);
        }
        public static decimal CalculateExpenseAmountExpense(List<ExpenseCompensationScale> compensationScales, string expenseType)
        {
            return compensationScales
                .Where(scale => scale.ExpenseType?.Type == expenseType)
                .Sum(scale => scale.Amount);
        }
    }
}