using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.IO.Font.Constants;
using iText.Kernel.Font;
using iText.Layout.Properties;
using iText.Layout.Borders;
using iText.Kernel.Colors;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Utils.pdf
{
    public class PdfGenerator
    {
        private readonly object? _description;
        private readonly List<object>? _tables;
        private const string ImagePath = "wwwroot/images/logo.png";

        // Palette de couleurs personnalisée
        private readonly DeviceRgb _primaryColor = new DeviceRgb(105, 180, 46);    // Vert principal
        private readonly DeviceRgb _secondaryColor = new DeviceRgb(157, 157, 156);  // Gris moyen
        private readonly DeviceRgb _accentColor = new DeviceRgb(227, 6, 19);        // Rouge accent
        private readonly DeviceRgb _lightGray = new DeviceRgb(245, 245, 245);       // Gris très clair
        private readonly DeviceRgb _darkGray = new DeviceRgb(120, 120, 120);        // Gris foncé

        public PdfGenerator(object? description = null, List<object>? tables = null)
        {
            _description = description;
            _tables = tables;
        }

        public byte[] GeneratePdf(string? title = null, bool includeHeader = true, bool includeDescription = true, bool includeTable = true, bool includeFooter = true)
        {
            try
            {
                using var memoryStream = new MemoryStream();
                var writer = new PdfWriter(memoryStream);
                var pdf = new PdfDocument(writer);
                var document = new Document(pdf);

                // Marges personnalisées
                document.SetMargins(30, 30, 30, 30);

                var font = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
                var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

                if (includeHeader && !string.IsNullOrEmpty(title))
                {
                    GenerateHeader(document, boldFont, title);
                }

                if (includeDescription && _description != null)
                {
                    GenerateDescription(document, _description, font, boldFont);
                }

                if (includeTable && _tables != null && _tables.Count != 0)
                {
                    GenerateTable(document, _tables, font, boldFont);
                }

                if (includeFooter)
                {
                    GenerateFooter(document, font);
                }

                document.Close();
                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération du PDF: {ex.Message}", ex);
            }
        }
    
        //attestation d'emploi
        public byte[] GenerateEmploymentCertificate(EmployeeCertificate employeeCertificate, string companyName, string? issueDate, string issuePlace)
        {
            try
            {
                using var memoryStream = new MemoryStream();
                var writer = new PdfWriter(memoryStream);
                var pdf = new PdfDocument(writer);
                var document = new Document(pdf);

                // Marges personnalisées
                document.SetMargins(50, 50, 50, 50);

                var font = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
                var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

                // En-tête avec logo et titre
                GenerateHeader(document, boldFont, "ATTESTATION D’EMPLOI");

                // Contenu principal
                var content = new Paragraph()
                    .SetFont(font)
                    .SetFontSize(12)
                    .SetTextAlignment(TextAlignment.JUSTIFIED)
                    .SetMarginTop(20)
                    .SetMarginBottom(20);

                content.Add($"Nous, soussigné, {companyName}, attestons que Monsieur/Madame {employeeCertificate.EmployeeName}, ");
                content.Add($"né(e) le {employeeCertificate.BirthDate} à {employeeCertificate.BirthPlace}, titulaire CIN n°{employeeCertificate.CinNumber}, ");
                content.Add($"délivrée le {employeeCertificate.CinIssueDate} à {employeeCertificate.CinIssuePlace}, fait partie de notre Société ");
                content.Add($"en qualité de {employeeCertificate.JobTitle} du 1er janvier 2017 jusqu’à ce jour, ");
                content.Add($"Catégorie professionnelle {employeeCertificate.ProfessionalCategory} ;\n\n");
                content.Add("Il est lié à la société par un contrat de travail à durée indéterminée.\n\n");
                content.Add("En foi de quoi, la présente attestation est établie pour servir et valoir ce que de droit.");

                document.Add(content);

                // Pied de page avec lieu, date et signatures
                var footer = new Paragraph()
                    .SetFont(font)
                    .SetFontSize(12)
                    .SetMarginTop(30);

                issueDate = issueDate ?? DateTime.Now.ToString("dd MMMM yyyy");
                footer.Add($"{issuePlace}, le {issueDate}\n");
                footer.Add("Pour la Directrice des Ressources Humaines\n");
                footer.Add(new Text("Le Chef de Département Développement RH et Rémunération")
                    .SetFont(boldFont));

                document.Add(footer);

                // Signature placeholder
                var signatureTable = new Table(1)
                    .UseAllAvailableWidth()
                    .SetMarginTop(20)
                    .SetMarginBottom(20);

                var signatureCell = new Cell()
                    .Add(new Paragraph("(signature)")
                        .SetFont(font)
                        .SetFontSize(9)
                        .SetFontColor(_darkGray)
                        .SetTextAlignment(TextAlignment.CENTER))
                    .SetBorder(Border.NO_BORDER)
                    .SetPadding(20)
                    .SetMinHeight(40);

                signatureTable.AddCell(signatureCell);
                document.Add(signatureTable);

                document.Close();
                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération de l'attestation d'emploi: {ex.Message}", ex);
            }
        }

        private void GenerateHeader(Document document, PdfFont boldFont, string title)
        {
            // En-tête avec fond coloré
            var headerTable = new Table(UnitValue.CreatePercentArray([1, 4]))
                .UseAllAvailableWidth()
                .SetMarginBottom(20);

            // Cellule pour le logo avec fond coloré
            var logoCell = new Cell()
                .SetBorder(Border.NO_BORDER)
                .SetPadding(15)
                .SetVerticalAlignment(VerticalAlignment.MIDDLE);

            if (File.Exists(ImagePath))
            {
                var imageData = iText.IO.Image.ImageDataFactory.Create(ImagePath);
                var image = new Image(imageData)
                    .SetHeight(50)
                    .SetAutoScaleWidth(true);
                logoCell.Add(image);
            }
            else
            {
                // Placeholder élégant si pas de logo
                var placeholder = new Paragraph("LOGO")
                    .SetFont(boldFont)
                    .SetFontSize(14)
                    .SetFontColor(ColorConstants.BLACK)
                    .SetTextAlignment(TextAlignment.CENTER);
                logoCell.Add(placeholder);
            }

            // Cellule pour le titre avec dégradé visuel
            var titleCell = new Cell()
                .SetBackgroundColor(_primaryColor)
                .SetBorder(Border.NO_BORDER)
                .SetPadding(15)
                .SetVerticalAlignment(VerticalAlignment.MIDDLE);

            var titleParagraph = new Paragraph(title)
                .SetFont(boldFont)
                .SetFontSize(22)
                .SetFontColor(ColorConstants.WHITE)
                .SetTextAlignment(TextAlignment.CENTER);

            titleCell.Add(titleParagraph);

            headerTable.AddCell(logoCell);
            headerTable.AddCell(titleCell);

            document.Add(headerTable);

            // Ligne de séparation élégante
            var separator = new Table(1)
                .UseAllAvailableWidth()
                .SetHeight(3)
                .SetBackgroundColor(_accentColor)
                .SetMarginBottom(25);
            separator.AddCell(new Cell().SetBorder(Border.NO_BORDER));
            document.Add(separator);
        }

        private void GenerateDescription(Document document, object description, PdfFont font, PdfFont boldFont)
        {
            // Titre de section
            var sectionTitle = new Paragraph("INFORMATIONS DÉTAILLÉES")
                .SetFont(boldFont)
                .SetFontSize(16)
                .SetFontColor(_secondaryColor)
                .SetMarginBottom(15);
            document.Add(sectionTitle);

            var props = description.GetType().GetProperties();
            var list = props.Select(p => new { Name = FormatPropertyName(p.Name), Value = p.GetValue(description)?.ToString() ?? "N/A" }).ToList();

            var table = new Table(UnitValue.CreatePercentArray([1, 2]))
                .UseAllAvailableWidth()
                .SetMarginBottom(25);

            var isEvenRow = false;
            foreach (var item in list)
            {
                var backgroundColor = isEvenRow ? _lightGray : ColorConstants.WHITE;

                var cellName = new Cell()
                    .Add(new Paragraph(item.Name)
                        .SetFont(boldFont)
                        .SetFontSize(11)
                        .SetFontColor(_secondaryColor))
                    .SetBackgroundColor(backgroundColor)
                    .SetPadding(12)
                    .SetBorderLeft(new SolidBorder(_primaryColor, 3))
                    .SetBorderTop(Border.NO_BORDER)
                    .SetBorderRight(Border.NO_BORDER)
                    .SetBorderBottom(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f));

                var cellValue = new Cell()
                    .Add(new Paragraph(item.Value)
                        .SetFont(font)
                        .SetFontSize(11)
                        .SetFontColor(ColorConstants.BLACK))
                    .SetBackgroundColor(backgroundColor)
                    .SetPadding(12)
                    .SetBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f))
                    .SetBorderTop(Border.NO_BORDER)
                    .SetBorderLeft(Border.NO_BORDER);

                table.AddCell(cellName);
                table.AddCell(cellValue);
                isEvenRow = !isEvenRow;
            }

            document.Add(table);
        }

        private void GenerateTable(Document document, List<object> tableData, PdfFont font, PdfFont boldFont)
        {
            // Titre de section pour le tableau
            var sectionTitle = new Paragraph("DONNÉES TABULAIRES")
                .SetFont(boldFont)
                .SetFontSize(16)
                .SetFontColor(_secondaryColor)
                .SetMarginBottom(15);
            document.Add(sectionTitle);

            var rows = tableData.Select(item => item as List<string>).ToList();
            if (rows.Any(row => row == null))
                throw new Exception("Certains éléments ne sont pas des lignes valides (List<string>).");

            var columnCount = rows[0]!.Count;
            var table = new Table(columnCount)
                .UseAllAvailableWidth()
                .SetMarginBottom(20);

            // En-têtes avec style élégant
            var headerRow = rows[0];
            if (headerRow != null)
                foreach (var headerCell in headerRow.Select(header => new Cell()
                             .Add(new Paragraph(header)
                                 .SetFont(boldFont)
                                 .SetFontSize(12)
                                 .SetFontColor(ColorConstants.WHITE)
                                 .SetTextAlignment(TextAlignment.CENTER))
                             .SetBackgroundColor(_primaryColor)
                             .SetPadding(12)
                             .SetBorder(Border.NO_BORDER)))
                {
                    table.AddHeaderCell(headerCell);
                }

            // Lignes de données avec alternance de couleurs
            var isEvenRow = false;
            foreach (var row in rows.Skip(1))
            {
                var backgroundColor = isEvenRow ? _lightGray : ColorConstants.WHITE;
                
                foreach (var cell in row!.Select(cellValue => new Cell()
                             .Add(new Paragraph(cellValue)
                                 .SetFont(font)
                                 .SetFontSize(10)
                                 .SetTextAlignment(TextAlignment.LEFT))
                             .SetBackgroundColor(backgroundColor)
                             .SetPadding(10)
                             .SetBorder(new SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f))))
                {
                    table.AddCell(cell);
                }
                isEvenRow = !isEvenRow;
            }

            document.Add(table);
        }

        private void GenerateFooter(Document document, PdfFont font)
        {
            // Espace avant les signatures
            document.Add(new Paragraph("\n"));
            
            // Section signatures
            var signatureTitle = new Paragraph("SIGNATURES")
                .SetFont(PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD))
                .SetFontSize(14)
                .SetFontColor(_secondaryColor)
                .SetMarginBottom(15);
            document.Add(signatureTitle);

            // Tableau des signatures
            var signatureTable = new Table(UnitValue.CreatePercentArray([1, 1, 1]))
                .UseAllAvailableWidth()
                .SetMarginBottom(20);

            // Première ligne - Titres
            var requirantCell = new Cell()
                .Add(new Paragraph("Le Requérant")
                    .SetFont(font)
                    .SetFontSize(11)
                    .SetBold()
                    .SetTextAlignment(TextAlignment.CENTER))
                .SetBorder(Border.NO_BORDER)
                .SetPadding(5);

            var directeurCell = new Cell()
                .Add(new Paragraph("Le Directeur de tutelle")
                    .SetFont(font)
                    .SetFontSize(11)
                    .SetBold()
                    .SetTextAlignment(TextAlignment.CENTER))
                .SetBorder(Border.NO_BORDER)
                .SetPadding(5);

            var chefCell = new Cell()
                .Add(new Paragraph("Le Chef de Département/Service")
                    .SetFont(font)
                    .SetFontSize(11)
                    .SetBold()
                    .SetTextAlignment(TextAlignment.CENTER))
                .SetBorder(Border.NO_BORDER)
                .SetPadding(5);

            signatureTable.AddCell(requirantCell);
            signatureTable.AddCell(directeurCell);
            signatureTable.AddCell(chefCell);

            // Deuxième ligne - Précisions
            var employeCell = new Cell()
                .Add(new Paragraph("(employé envoyé en mission)")
                    .SetFont(font)
                    .SetFontSize(9)
                    .SetFontColor(_darkGray)
                    .SetTextAlignment(TextAlignment.CENTER))
                .SetBorder(Border.NO_BORDER)
                .SetPadding(5);

            var emptyCell1 = new Cell()
                .Add(new Paragraph(""))
                .SetBorder(Border.NO_BORDER)
                .SetPadding(5);

            var emptyCell2 = new Cell()
                .Add(new Paragraph(""))
                .SetBorder(Border.NO_BORDER)
                .SetPadding(5);

            signatureTable.AddCell(employeCell);
            signatureTable.AddCell(emptyCell1);
            signatureTable.AddCell(emptyCell2);

            // Troisième ligne - Espaces pour signatures
            var signatureSpace1 = new Cell()
                .Add(new Paragraph("(signature)")
                    .SetFont(font)
                    .SetFontSize(9)
                    .SetFontColor(_darkGray)
                    .SetTextAlignment(TextAlignment.CENTER))
                .SetBorder(Border.NO_BORDER)
                .SetPadding(20)
                .SetMinHeight(40);

            var signatureSpace2 = new Cell()
                .Add(new Paragraph("(signature)")
                    .SetFont(font)
                    .SetFontSize(9)
                    .SetFontColor(_darkGray)
                    .SetTextAlignment(TextAlignment.CENTER))
                .SetBorder(Border.NO_BORDER)
                .SetPadding(20)
                .SetMinHeight(40);

            var signatureSpace3 = new Cell()
                .Add(new Paragraph("(signature)")
                    .SetFont(font)
                    .SetFontSize(9)
                    .SetFontColor(_darkGray)
                    .SetTextAlignment(TextAlignment.CENTER))
                .SetBorder(Border.NO_BORDER)
                .SetPadding(20)
                .SetMinHeight(40);

            signatureTable.AddCell(signatureSpace1);
            signatureTable.AddCell(signatureSpace2);
            signatureTable.AddCell(signatureSpace3);

            document.Add(signatureTable);

            // Notes importantes avec encadré
            var notesTitle = new Paragraph("NOTES IMPORTANTES")
                .SetFont(PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD))
                .SetFontSize(12)
                .SetFontColor(_accentColor)
                .SetMarginBottom(10);
            document.Add(notesTitle);

            var notesTable = new Table(1)
                .UseAllAvailableWidth()
                .SetMarginBottom(15);

            const string notesText = "• L'ordre de mission dûment visé et signé doit être remis au Département Finances et Comptabilité dans les 3 jours ouvrables suivant le retour de mission faute de quoi les indemnités seront déduites sur le prochain salaire car non justifiées.\n\n" +
                                     "• Au cas où la mission est annulée ou reportée à plus d'une semaine, les sommes avancées doivent être remises au Département Finances et Comptabilité.";

            var notesCell = new Cell()
                .Add(new Paragraph(notesText)
                    .SetFont(font)
                    .SetFontSize(10)
                    .SetTextAlignment(TextAlignment.JUSTIFIED))
                .SetBackgroundColor(new DeviceRgb(255, 248, 248))
                .SetBorder(new SolidBorder(_accentColor, 1))
                .SetPadding(15);

            notesTable.AddCell(notesCell);
            document.Add(notesTable);

            // Ligne de séparation
            var separator = new Table(1)
                .UseAllAvailableWidth()
                .SetHeight(1)
                .SetBackgroundColor(_darkGray)
                .SetMarginBottom(10);
            separator.AddCell(new Cell().SetBorder(Border.NO_BORDER));
            document.Add(separator);

            // Pied de page avec informations
            var footerTable = new Table(UnitValue.CreatePercentArray([1, 1]))
                .UseAllAvailableWidth();

            var dateText = new Paragraph($"Document généré le : {DateTime.Now:dd/MM/yyyy à HH:mm}")
                .SetFont(font)
                .SetFontSize(9)
                .SetFontColor(_darkGray)
                .SetTextAlignment(TextAlignment.LEFT);

            var companyText = new Paragraph("© Ravinala Airport - Document")
                .SetFont(font)
                .SetFontSize(9)
                .SetFontColor(_darkGray)
                .SetTextAlignment(TextAlignment.RIGHT);

            footerTable.AddCell(new Cell().Add(dateText).SetBorder(Border.NO_BORDER));
            footerTable.AddCell(new Cell().Add(companyText).SetBorder(Border.NO_BORDER));

            document.Add(footerTable);
        }

        private static string FormatPropertyName(string propertyName)
        {
            // Conversion des noms de propriétés en français avec formatage
            var translations = new Dictionary<string, string>
            {
                {"MissionId", "ID Mission"},
                {"EmployeeId", "ID Employé"},
                {"StartDate", "Date de Début"},
                {"EndDate", "Date de Fin"},
                {"Name", "Nom"},
                {"Description", "Description"},
                {"Status", "Statut"},
                {"Amount", "Montant"},
                {"Reference", "Référence"}
            };

            return translations.TryGetValue(propertyName, out var value) ? value : propertyName;
        }
    }
}