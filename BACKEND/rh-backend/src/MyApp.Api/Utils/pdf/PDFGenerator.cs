using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.IO.Font.Constants;
using iText.Kernel.Font;
using System.Reflection;

namespace MyApp.Utils.pdf
{
    public class PDFGenerator
    {
        private readonly object _description;
        private readonly List<object> _tables;

        public PDFGenerator(object description, List<object> tables)
        {
            _description = description ?? throw new ArgumentNullException(nameof(description));
            _tables = tables ?? throw new ArgumentNullException(nameof(tables));
        }

        public byte[] GeneratePdf()
        {
            try
            {
                using (MemoryStream memoryStream = new MemoryStream())
                {
                    var writer = new PdfWriter(memoryStream);
                    var pdf = new PdfDocument(writer);
                    var document = new Document(pdf);

                    // Description
                    GenerateDescription(document, _description);

                    // Tables
                    GenerateTable(document, _tables);

                    document.Close();
                    return memoryStream.ToArray();
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la génération du PDF: {ex.Message}", ex);
            }
        }

        private void GenerateDescription(Document document, object description)
        {
            try
            {
                var font = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
                var props = description.GetType().GetProperties();

                foreach (var prop in props)
                {
                    string name = prop.Name;
                    string value = prop.GetValue(description)?.ToString() ?? "N/A";

                    var para = new Paragraph($"{name} : {value}")
                        .SetFont(font)
                        .SetFontSize(12)
                        .SetMarginBottom(4);

                    document.Add(para);
                }

                document.Add(new Paragraph("\n"));
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur dans GenerateDescription: {ex.Message}", ex);
            }
        }

        private void GenerateTable(Document document, List<object> tableData)
        {
            try
            {
                if (!tableData.Any())
                    return;

                // On suppose ici que tableData est une List<List<string>>
                var font = PdfFontFactory.CreateFont(StandardFonts.HELVETICA);
                var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

                // On caste les lignes en List<string>
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
            catch (Exception ex)
            {
                throw new Exception($"Erreur dans GenerateTable: {ex.Message}", ex);
            }
        }
    }
}

// {
//   "missionId": "MIS-000001",
//   "employeeId": "EMP_0001",
//   "directionId": "string",
//   "startDate": "2025-07-29",
//   "endDate": "2025-08-03"
// }
