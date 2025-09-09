using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.IO.Font.Constants;
using iText.IO.Image;
using iText.Kernel.Font;
using iText.Layout.Properties;
using iText.Layout.Borders;
using iText.Kernel.Colors;
using iText.Kernel.Events;
using iText.Kernel.Pdf.Canvas;
using MyApp.Api.Entities.certificate;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Utils.pdf
{
    public class PdfGenerator(object? description = null, List<object>? tables = null)
    {
        private const string ImagePath = @"F:\Stage-RH\Projet\GESTION-RH\FRONTEND\rh-front\public\Logo.png";

        // Palette de couleurs personnalisée
        private readonly DeviceRgb _primaryColor = new DeviceRgb(105, 180, 46);    // Vert principal
        private readonly DeviceRgb _secondaryColor = new DeviceRgb(157, 157, 156);  // Gris moyen
        private readonly DeviceRgb _accentColor = new DeviceRgb(227, 6, 19);        // Rouge accent
        private readonly DeviceRgb _lightGray = new DeviceRgb(245, 245, 245);       // Gris très clair
        private readonly DeviceRgb _darkGray = new DeviceRgb(120, 120, 120);        // Gris foncé

        // Attestation d'hébergement
        public byte[] GenerateHostingCertificatePdf(HostingCertificate hostingCertificate)
        {
            ArgumentNullException.ThrowIfNull(hostingCertificate);

            try
            {
                using var memoryStream = new MemoryStream();
                var writer = new PdfWriter(memoryStream);
                var pdf = new PdfDocument(writer);
                var document = new Document(pdf);

                document.SetMargins(100, 30, 60, 30);

                var font = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
                var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
                
                pdf.AddEventHandler(PdfDocumentEvent.END_PAGE, new FooterHandler(font, this, hostingCertificate.FooterDetails));

                AddLogo(document);

                var attestationTitle = new Paragraph("ATTESTATION D'HÉBERGEMENT ET DE PRISE EN CHARGE")
                    .SetFont(boldFont)
                    .SetFontSize(16)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetMarginBottom(20);
                document.Add(attestationTitle);

                var genderPrefix = hostingCertificate.Gender.Equals("masculin", StringComparison.CurrentCultureIgnoreCase) ? "Monsieur" : "Madame";

                var bodyText = new Paragraph($"Nous, soussigné, {hostingCertificate.CompanyName}, attestons par la présente que nous prendrons en charge les frais d'hébergement ainsi que les frais de séjour d'un montant de {hostingCertificate.Amount} euros " +
                                             $"de {genderPrefix} {hostingCertificate.EmployeeName}, employé au sein de notre Société en qualité de {hostingCertificate.JobTitle}.\n" +
                                             $"Nous prendrons en charge, éventuellement en cas de besoin ses frais d'hospitalisation et son billet d'avion retour dans son pays d'origine, à l'issue du séjour accordé.")
                    .SetFont(font)
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.JUSTIFIED)
                    .SetMarginBottom(20);
                document.Add(bodyText);

                var finalClause = new Paragraph("En foi de quoi, la présente attestation est établie pour servir et valoir ce que de droit.")
                    .SetFont(font)
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.JUSTIFIED)
                    .SetMarginBottom(15);
                document.Add(finalClause);

                var placeDate = new Paragraph($"{hostingCertificate.IssuePlace}, le {DateTime.Now:dd MMMM yyyy}")
                    .SetFont(font)
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.RIGHT)
                    .SetMarginBottom(20);
                document.Add(placeDate);

                var hrSignature = new Paragraph("Pour la Directrice des Ressources Humaines")
                    .SetFont(boldFont)
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetMarginBottom(10);
                document.Add(hrSignature);

                var signatory = new Paragraph($"{hostingCertificate.SignatoryName}")
                    .SetFont(boldFont)
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.CENTER);
                document.Add(signatory);

                document.Close();

                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération de l'attestation d'hébergement: {ex.Message}", ex);
            }
        }

        // Attestation de travail
        public byte[] GenerateEmploymentCertificatePdf(EmployeeCertificate employeeCertificate)
        {
            ArgumentNullException.ThrowIfNull(employeeCertificate);

            try
            {
                using var memoryStream = new MemoryStream();
                var writer = new PdfWriter(memoryStream);
                var pdf = new PdfDocument(writer);
                var document = new Document(pdf);

                document.SetMargins(100, 30, 60, 30);

                var font = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
                var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);
                
                pdf.AddEventHandler(PdfDocumentEvent.END_PAGE, new FooterHandler(font, this, employeeCertificate.FooterDetails));

                AddLogo(document);

                var attestationTitle = new Paragraph("ATTESTATION D’EMPLOI")
                    .SetFont(boldFont)
                    .SetFontSize(16)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetMarginBottom(20);
                document.Add(attestationTitle);

                var genderPrefix = employeeCertificate.Gender.Equals("masculin", StringComparison.CurrentCultureIgnoreCase) ? "Monsieur" : "Madame";
                var birthPrefix = employeeCertificate.Gender.Equals("masculin", StringComparison.CurrentCultureIgnoreCase) ? "né" : "née";
                var pronoun = employeeCertificate.Gender.Equals("masculin", StringComparison.CurrentCultureIgnoreCase) ? "Il" : "Elle";

                var bodyText = new Paragraph($"Nous, soussigné, {employeeCertificate.CompanyName}, attestons que {genderPrefix} {employeeCertificate.EmployeeName}, " +
                                             $"{birthPrefix} le {employeeCertificate.BirthDate} à {employeeCertificate.BirthPlace}, " +
                                             $"titulaire CIN n° {employeeCertificate.CinNumber}, " +
                                             $"délivrée le {employeeCertificate.CinIssueDate} à {employeeCertificate.CinIssuePlace}, " +
                                             $"fait partie de notre Société en qualité de {employeeCertificate.JobTitle} du {employeeCertificate.HiringDate} " +
                                             $"jusqu’à ce jour, Catégorie professionnelle {employeeCertificate.ProfessionalCategory}" +
                                             $"\n\n{pronoun} est lié à la société par un {employeeCertificate.ContractType}.")
                    .SetFont(font)
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.JUSTIFIED)
                    .SetMarginBottom(20);
                document.Add(bodyText);

                var finalClause = new Paragraph("En foi de quoi, la présente attestation est établie pour servir et valoir ce que de droit.")
                    .SetFont(font)
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.JUSTIFIED)
                    .SetMarginBottom(15);
                document.Add(finalClause);

                var placeDate = new Paragraph($"{employeeCertificate.IssuePlace}, le {DateTime.Now:dd MMMM yyyy}")
                    .SetFont(font)
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.RIGHT)
                    .SetMarginBottom(20);
                document.Add(placeDate);

                var hrSignature = new Paragraph("Pour la Directrice des Ressources Humaines")
                    .SetFont(boldFont)
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetMarginBottom(10);
                document.Add(hrSignature);

                var serviceSignature = new Paragraph($"Le Chef de Département {employeeCertificate.Service}")
                    .SetFont(boldFont)
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.CENTER)
                    .SetMarginBottom(10);
                document.Add(serviceSignature);

                var signatory = new Paragraph($"{employeeCertificate.SignatoryName}")
                    .SetFont(boldFont)
                    .SetFontSize(11)
                    .SetTextAlignment(TextAlignment.CENTER);
                document.Add(signatory);

                document.Close();

                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération de l'attestation d'emploi: {ex.Message}", ex);
            }
        }

        // Ordre de mission
        public byte[] GenerateMissionOrderPdf(MissionAssignation missionAssignation, string title = "Ordre de mission", string reference = "RHS-ENR-037")
        {
            if (missionAssignation?.Employee == null || missionAssignation.Mission == null || missionAssignation.Transport == null)
                throw new ArgumentNullException(nameof(missionAssignation), "MissionAssignation or its nested objects cannot be null.");

            try
            {
                using var memoryStream = new MemoryStream();
                var writer = new PdfWriter(memoryStream);
                var pdf = new PdfDocument(writer);
                var document = new Document(pdf);

                document.SetMargins(100, 30, 60, 30);

                var font = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
                var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

                pdf.AddEventHandler(PdfDocumentEvent.START_PAGE, new HeaderHandler(boldFont, title, "Formulaire", reference));
                pdf.AddEventHandler(PdfDocumentEvent.END_PAGE, new FooterHandler(font, this, null)); // No specific footer details for mission order

                AddLogo(document);

                var titleParagraph = new Paragraph("N° " + reference)
                    .SetFont(boldFont)
                    .SetFontSize(14)
                    .SetTextAlignment(TextAlignment.RIGHT)
                    .SetMarginBottom(10);
                document.Add(titleParagraph);

                var orderedTo = new Paragraph("Il est ordonné à :")
                    .SetFont(boldFont)
                    .SetFontSize(12)
                    .SetMarginBottom(5);
                document.Add(orderedTo);

                var nameLabel = new Paragraph($"Nom et prénoms : {missionAssignation.Employee.FirstName} {missionAssignation.Employee.LastName}")
                    .SetFont(boldFont)
                    .SetFontSize(11);
                var functionLabel = new Paragraph($"Fonction : {missionAssignation.Employee.JobTitle}        Matricule : {missionAssignation.Employee.EmployeeCode}")
                    .SetFont(font)
                    .SetFontSize(11);
                var departmentLabel = new Paragraph($"Direction : {missionAssignation.Employee.Department} / Service : {missionAssignation.Employee.Service}")
                    .SetFont(font)
                    .SetFontSize(11);

                var orderedToTable = new Table(UnitValue.CreatePercentArray([1]))
                    .UseAllAvailableWidth()
                    .SetMarginBottom(15);
                orderedToTable.AddCell(new Cell().Add(nameLabel).SetBorder(Border.NO_BORDER));
                orderedToTable.AddCell(new Cell().Add(functionLabel).SetBorder(Border.NO_BORDER));
                orderedToTable.AddCell(new Cell().Add(departmentLabel).SetBorder(Border.NO_BORDER));
                document.Add(orderedToTable);

                var destinationLabel = new Paragraph($"De se rendre à : {missionAssignation.Mission.Lieu?.Nom ?? "Non spécifié"}")
                    .SetFont(boldFont)
                    .SetFontSize(11)
                    .SetMarginBottom(5);
                document.Add(destinationLabel);

                var motiveLabel = new Paragraph($"Motif : {missionAssignation.Mission.Description}")
                    .SetFont(boldFont)
                    .SetFontSize(11)
                    .SetMarginBottom(5);
                document.Add(motiveLabel);

                var transportLabel = new Paragraph($"Moyen de transport : {missionAssignation.Transport.Type}")
                    .SetFont(boldFont)
                    .SetFontSize(11)
                    .SetMarginBottom(5);
                document.Add(transportLabel);

                var departureLabel = new Paragraph($"Date et heure de départ : {missionAssignation.DepartureDate:dd/MM/yyyy} {missionAssignation.DepartureTime:HH:mm}")
                    .SetFont(boldFont)
                    .SetFontSize(11)
                    .SetMarginBottom(5);
                document.Add(departureLabel);

                var visaLabel = new Paragraph("Visa Direction des Ressources Humaines           La Direction de tutelle")
                    .SetFont(boldFont)
                    .SetFontSize(11)
                    .SetMarginBottom(15);
                document.Add(visaLabel);

                var arrivalTitle = new Paragraph("__ARRIVEE SUR LE LIEU DE REALISATION DE LA MISSION__ :")
                    .SetFont(boldFont)
                    .SetFontSize(12)
                    .SetMarginBottom(5);
                document.Add(arrivalTitle);

                var arrivalTable = new Table(UnitValue.CreatePercentArray([1, 1]))
                    .UseAllAvailableWidth()
                    .SetMarginBottom(15);
                arrivalTable.AddCell(new Cell().Add(new Paragraph("Date :").SetFont(boldFont).SetFontSize(11)).SetBorder(Border.NO_BORDER));
                arrivalTable.AddCell(new Cell().Add(new Paragraph("Nom, prénoms et fonction de l’Autorité").SetFont(font).SetFontSize(11)).SetBorder(Border.NO_BORDER));
                arrivalTable.AddCell(new Cell().Add(new Paragraph("Heure :").SetFont(boldFont).SetFontSize(11)).SetBorder(Border.NO_BORDER));
                arrivalTable.AddCell(new Cell().Add(new Paragraph("Signature et cachet").SetFont(font).SetFontSize(11)).SetBorder(Border.NO_BORDER));
                document.Add(arrivalTable);

                var departureTitle = new Paragraph("DEPART DU LIEU DE REALISATION DE LA MISSION :")
                    .SetFont(boldFont)
                    .SetFontSize(12)
                    .SetMarginBottom(5);
                document.Add(departureTitle);

                var departureTable = new Table(UnitValue.CreatePercentArray([1, 1]))
                    .UseAllAvailableWidth()
                    .SetMarginBottom(15);
                departureTable.AddCell(new Cell().Add(new Paragraph("Date :").SetFont(boldFont).SetFontSize(11)).SetBorder(Border.NO_BORDER));
                departureTable.AddCell(new Cell().Add(new Paragraph("Nom, prénoms et fonction de l’Autorité").SetFont(font).SetFontSize(11)).SetBorder(Border.NO_BORDER));
                departureTable.AddCell(new Cell().Add(new Paragraph("Heure :").SetFont(boldFont).SetFontSize(11)).SetBorder(Border.NO_BORDER));
                departureTable.AddCell(new Cell().Add(new Paragraph("Signature et cachet").SetFont(font).SetFontSize(11)).SetBorder(Border.NO_BORDER));
                document.Add(departureTable);

                var returnTitle = new Paragraph("ARRIVEE SUR LE LIEU DE TRAVAIL HABITUEL :")
                    .SetFont(boldFont)
                    .SetFontSize(12)
                    .SetMarginBottom(5);
                document.Add(returnTitle);

                var returnTable = new Table(UnitValue.CreatePercentArray([1]))
                    .UseAllAvailableWidth()
                    .SetMarginBottom(15);
                returnTable.AddCell(new Cell().Add(new Paragraph("Date : Heure :").SetFont(boldFont).SetFontSize(11)).SetBorder(Border.NO_BORDER));
                document.Add(returnTable);

                document.Close();

                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération du formulaire d'ordre de mission: {ex.Message}", ex);
            }
        }

        // PDF pour indemnité de mission
        public byte[] GenerateMissionPaiementPdf(string title)
        {
            try
            {
                using var memoryStream = new MemoryStream();
                var writer = new PdfWriter(memoryStream);
                var pdf = new PdfDocument(writer);
                var document = new Document(pdf);

                document.SetMargins(100, 30, 60, 30);

                var font = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
                var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

                pdf.AddEventHandler(PdfDocumentEvent.START_PAGE, new HeaderHandler(boldFont, title, "", "PAY-001"));
                pdf.AddEventHandler(PdfDocumentEvent.END_PAGE, new FooterHandler(font, this, null)); // No specific footer details for mission payment

                AddLogo(document);
                AddTitle(document, boldFont, title);

                GenerateDescription("INFORMATIONS DÉTAILLES", document, font, boldFont);
                GenerateTable(document, tables, font, boldFont);
                GenerateMissionPaiementFooter(document, font);

                document.Close();

                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération du PDF d'indemnité de mission: {ex.Message}", ex);
            }
        }

        private void AddTitle(Document document, PdfFont boldFont, string title)
        {
            var titleParagraph = new Paragraph(title)
                .SetFont(boldFont)
                .SetFontSize(18)
                .SetFontColor(_secondaryColor)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetMarginBottom(20);
            document.Add(titleParagraph);
        }

        private static void AddLogo(Document document)
        {
            // if (!File.Exists(ImagePath)) return;
            // var imageData = ImageDataFactory.Create(ImagePath);
            // var image = new Image(imageData)
            //     .SetHeight(50)
            //     .SetAutoScaleWidth(true)
            //     .SetHorizontalAlignment(HorizontalAlignment.LEFT);
            //
            // var logoCell = new Cell()
            //     .SetBorder(Border.NO_BORDER)
            //     .SetPadding(10)
            //     .Add(image);
            //
            // var logoTable = new Table(UnitValue.CreatePercentArray([1]))
            //     .UseAllAvailableWidth()
            //     .SetMarginBottom(15);
            // logoTable.AddCell(logoCell);
            //
            // document.Add(logoTable);
        }

        private void AddHeader(Canvas canvas, PdfFont boldFont, string? title, string? subTitle, string? reference, int currentPage, int totalPages)
        {
            canvas.Add(CreateHeaderTable(boldFont, title, subTitle, reference, currentPage, totalPages));
            canvas.Add(CreateHeaderSeparator());
        }

        private Table CreateHeaderTable(PdfFont boldFont, string? title, string? subTitle, string? reference, int currentPage, int totalPages)
        {
            var headerTable = new Table(UnitValue.CreatePercentArray([1, 3, 1]))
                .UseAllAvailableWidth()
                .SetMarginBottom(20)
                .SetBorder(new SolidBorder(_darkGray, 1));

            var logoCell = new Cell()
                .SetBorder(Border.NO_BORDER)
                .SetPadding(10)
                .SetVerticalAlignment(VerticalAlignment.MIDDLE);

            // if (File.Exists(ImagePath))
            // {
            //     var imageData = ImageDataFactory.Create(ImagePath);
            //     var image = new Image(imageData)
            //         .SetHeight(50)
            //         .SetAutoScaleWidth(true);
            //     logoCell.Add(image);
            // }

            var titleCell = new Cell()
                .SetBorder(Border.NO_BORDER)
                .SetPadding(15)
                .SetVerticalAlignment(VerticalAlignment.MIDDLE);

            var titleParagraph = new Paragraph(title)
                .SetFont(boldFont)
                .SetFontSize(18)
                .SetFontColor(_secondaryColor)
                .SetTextAlignment(TextAlignment.CENTER);

            var subTitleParagraph = new Paragraph(subTitle)
                .SetFont(boldFont)
                .SetFontSize(12)
                .SetFontColor(_darkGray)
                .SetTextAlignment(TextAlignment.CENTER);

            titleCell.Add(titleParagraph);
            titleCell.Add(subTitleParagraph);

            var infoCell = new Cell()
                .SetBorder(Border.NO_BORDER)
                .SetPadding(10)
                .SetVerticalAlignment(VerticalAlignment.TOP);

            var referenceText = new Paragraph($"Référence:{reference}")
                .SetFont(boldFont)
                .SetFontSize(10)
                .SetTextAlignment(TextAlignment.RIGHT)
                .SetMarginBottom(5);

            var dateText = new Paragraph($"Date: {DateTime.Now:dd/MM/yyyy HH:mm} EAT")
                .SetFont(boldFont)
                .SetFontSize(9)
                .SetTextAlignment(TextAlignment.RIGHT)
                .SetMarginBottom(5);

            var pageText = new Paragraph($"Page: {currentPage}/{totalPages}")
                .SetFont(boldFont)
                .SetFontSize(9)
                .SetTextAlignment(TextAlignment.RIGHT);

            infoCell.Add(referenceText);
            infoCell.Add(dateText);
            infoCell.Add(pageText);

            headerTable.AddCell(logoCell);
            headerTable.AddCell(titleCell);
            headerTable.AddCell(infoCell);

            return headerTable;
        }

        private Table CreateHeaderSeparator()
        {
            var separator = new Table(1)
                .UseAllAvailableWidth()
                .SetHeight(3)
                .SetBackgroundColor(_accentColor)
                .SetMarginBottom(25);
            separator.AddCell(new Cell().SetBorder(Border.NO_BORDER));
            return separator;
        }

        private void GenerateMissionPaiementFooter(Document document, PdfFont font)
        {
            document.Add(new Paragraph("\n"));

            var signatureTitle = new Paragraph("SIGNATURES")
                .SetFont(PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD))
                .SetFontSize(14)
                .SetFontColor(_secondaryColor)
                .SetMarginBottom(15);
            document.Add(signatureTitle);

            var signatureTable = new Table(UnitValue.CreatePercentArray([1, 1, 1]))
                .UseAllAvailableWidth()
                .SetMarginBottom(20);

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
        }

        private void GenerateDescription(string? title, Document document, PdfFont font, PdfFont boldFont)
        {
            var sectionTitle = new Paragraph(title)
                .SetFont(boldFont)
                .SetFontSize(16)
                .SetFontColor(_secondaryColor)
                .SetMarginBottom(15);
            document.Add(sectionTitle);

            var props = description?.GetType().GetProperties();
            if (props == null) return;
            var list = props.Select(p => new { Name = FormatPropertyNameForMissionPaiement(p.Name), Value = p.GetValue(description)?.ToString() ?? "N/A" }).ToList();

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

        private void GenerateTable(Document document, List<object>? tableData, PdfFont font, PdfFont boldFont)
        {
            var sectionTitle = new Paragraph("DONNÉES TABULAIRES")
                .SetFont(boldFont)
                .SetFontSize(16)
                .SetFontColor(_secondaryColor)
                .SetMarginBottom(15);
            document.Add(sectionTitle);

            if (tableData == null) return;
            var rows = tableData.Select(item => item as List<string>).ToList();
            if (rows.Any(row => row == null))
                throw new Exception("Certains éléments ne sont pas des lignes valides (List<string>).");

            var columnCount = rows[0]!.Count;
            var table = new Table(columnCount)
                .UseAllAvailableWidth()
                .SetMarginBottom(20);

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

        private Table CreateFooterSeparator()
        {
            var separator = new Table(1)
                .SetHeight(1)
                .SetBackgroundColor(_darkGray)
                .SetMarginBottom(10);
            separator.AddCell(new Cell().SetBorder(Border.NO_BORDER));
            return separator;
        }

        private Table CreateFooterTable(PdfFont font)
        {
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

            return footerTable;
        }

        private static string FormatPropertyNameForMissionPaiement(string propertyName)
        {
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

        private class HeaderHandler : IEventHandler
        {
            private readonly PdfFont _boldFont;
            private readonly string _title;
            private readonly string _subTitle;
            private readonly string _reference;

            public HeaderHandler(PdfFont boldFont, string title, string subTitle, string reference)
            {
                _boldFont = boldFont;
                _title = title;
                _subTitle = subTitle;
                _reference = reference;
            }

            public void HandleEvent(Event @event)
            {
                var docEvent = (PdfDocumentEvent)@event;
                var pdf = docEvent.GetDocument();
                var page = docEvent.GetPage();
                var pageSize = page.GetPageSize();
                using var canvas = new Canvas(new PdfCanvas(page), pageSize);
                new PdfGenerator().AddHeader(canvas, _boldFont, _title, _subTitle, _reference, pdf.GetPageNumber(page), pdf.GetNumberOfPages());
            }
        }

        private class FooterHandler : IEventHandler
        {
            private readonly PdfFont _font;
            private readonly PdfGenerator _parent;
            private readonly string? _footerDetails;

            public FooterHandler(PdfFont font, PdfGenerator parent, string? footerDetails)
            {
                _font = font;
                _parent = parent;
                _footerDetails = footerDetails;
            }

            public void HandleEvent(Event @event)
            {
                var docEvent = (PdfDocumentEvent)@event;
                var pdf = docEvent.GetDocument();
                var page = docEvent.GetPage();
                var pageSize = page.GetPageSize();

                var canvas = new Canvas(new PdfCanvas(page), pageSize);

                var width = pageSize.GetWidth() - 60;
                var footerDiv = new Div()
                    .SetWidth(width)
                    .SetFixedPosition(pageSize.GetLeft() + 30, pageSize.GetBottom() + 30, width);

                footerDiv.Add(_parent.CreateFooterSeparator());
                footerDiv.Add(_parent.CreateFooterTable(_font));

                if (!string.IsNullOrEmpty(_footerDetails))
                {
                    var footerText = new Paragraph(_footerDetails)
                        .SetFont(_font)
                        .SetFontSize(8)
                        .SetFontColor(_parent._darkGray)
                        .SetTextAlignment(TextAlignment.LEFT);
                    footerDiv.Add(footerText);
                }

                canvas.Add(footerDiv);
                canvas.Close();
            }
        }
    }
}