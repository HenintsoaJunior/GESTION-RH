using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.IO.Font;
using iText.IO.Font.Constants;
using iText.Kernel.Font;
using iText.Layout.Properties;
using iText.Layout.Borders;
using iText.Kernel.Colors;
using System.Reflection;

namespace MyApp.Utils.pdf
{
    public class PDFGenerator
    {
        private readonly object _description;
        private readonly List<object> _tables;
        private readonly string _imagePath = "wwwroot/images/logo.png"; // Ton logo

        public PDFGenerator(object description, List<object> tables)
        {
            _description = description ?? throw new ArgumentNullException(nameof(description));
            _tables = tables ?? throw new ArgumentNullException(nameof(tables));
        }

        public byte[] GeneratePdf(string title)
        {
            try
            {
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    var writer = new PdfWriter(memoryStream);
                    var pdf = new PdfDocument(writer);
                    var document = new Document(pdf);

                    // var font = PdfFontFactory.CreateFont("wwwroot/fonts/Montserrat-Regular.ttf", PdfEncodings.IDENTITY_H);
                    // var boldFont = PdfFontFactory.CreateFont("wwwroot/fonts/Montserrat-Bold.ttf", PdfEncodings.IDENTITY_H);

                    var font = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
                    var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

                    
                    GenerateHeader(document, font, boldFont, title);
                    GenerateDescription(document, _description, font);
                    GenerateTable(document, _tables, font, boldFont);

                    document.Close();
                    return memoryStream.ToArray();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération du PDF: {ex.Message}", ex);
            }
        }

        private void GenerateHeader(Document document, PdfFont font, PdfFont boldFont, string title)
        {
            var table = new Table(UnitValue.CreatePercentArray(new float[] { 1, 4 })).UseAllAvailableWidth();
            table.SetBorder(new SolidBorder(1));

            // Image
            if (File.Exists(_imagePath))
            {
                var imageData = iText.IO.Image.ImageDataFactory.Create(_imagePath);
                var image = new Image(imageData).SetHeight(60).SetAutoScaleWidth(true);
                table.AddCell(new Cell().Add(image).SetBorder(Border.NO_BORDER));
            }
            else
            {
                table.AddCell(new Cell().Add(new Paragraph("")).SetBorder(Border.NO_BORDER));
            }

            // Texte centré
            var text = new Paragraph(title)
                .SetFont(boldFont)
                .SetFontSize(18)
                .SetTextAlignment(TextAlignment.CENTER)
                .SetVerticalAlignment(VerticalAlignment.MIDDLE);
            table.AddCell(new Cell().Add(text).SetBorder(Border.NO_BORDER).SetVerticalAlignment(VerticalAlignment.MIDDLE));

            document.Add(table);
            document.Add(new Paragraph("\n"));
        }

        private void GenerateDescription(Document document, object description, PdfFont font)
        {
            var props = description.GetType().GetProperties();
            var list = props.Select(p => new { Name = p.Name, Value = p.GetValue(description)?.ToString() ?? "N/A" }).ToList();

            var table = new Table(2).UseAllAvailableWidth();

            foreach (var item in list)
            {
                var cellName = new Cell().Add(new Paragraph(item.Name).SetFont(font).SetFontSize(12).SetBold());
                var cellValue = new Cell().Add(new Paragraph(item.Value).SetFont(font).SetFontSize(12));
                table.AddCell(cellName);
                table.AddCell(cellValue);
            }

            document.Add(table);
            document.Add(new Paragraph("\n"));
        }

        private void GenerateTable(Document document, List<object> tableData, PdfFont font, PdfFont boldFont)
        {
            if (!tableData.Any())
                return;

            var rows = tableData.Select(item => item as List<string>).ToList();
            if (rows.Any(row => row == null))
                throw new Exception("Certains éléments ne sont pas des lignes valides (List<string>).");

            int columnCount = rows[0].Count;
            var table = new Table(columnCount).UseAllAvailableWidth();

            // En-têtes
            var headerRow = rows[0];
            foreach (var header in headerRow)
            {
                table.AddHeaderCell(new Cell().Add(new Paragraph(header).SetFont(boldFont)));
            }

            // Lignes de données
            foreach (var row in rows.Skip(1))
            {
                foreach (var cellValue in row)
                {
                    table.AddCell(new Cell().Add(new Paragraph(cellValue).SetFont(font)));
                }
            }

            document.Add(table);
        }
    }
}

// {
//   "missionId": "MIS-000001",
//   "employeeId": "EMP_0002",
//   "startDate": "2025-07-30",
//   "endDate": "2025-08-04"
// }
