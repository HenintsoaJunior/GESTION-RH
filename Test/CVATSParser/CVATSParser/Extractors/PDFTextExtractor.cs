using System;
using System.Text;
using System.Threading.Tasks;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using CVATSParser.Interfaces;

namespace CVATSParser.Extractors
{
    // Extracteur pour fichiers PDF
    public class PDFTextExtractor : ITextExtractor
    {
        public async Task<string> ExtractTextAsync(string filePath)
        {
            return await Task.Run(() =>
            {
                try
                {
                    using (var reader = new PdfReader(filePath))
                    using (var document = new PdfDocument(reader))
                    {
                        var text = new StringBuilder();
                        for (int i = 1; i <= document.GetNumberOfPages(); i++)
                        {
                            var page = document.GetPage(i);
                            var strategy = new SimpleTextExtractionStrategy();
                            var pageText = PdfTextExtractor.GetTextFromPage(page, strategy);
                            text.AppendLine(pageText);
                        }
                        return text.ToString();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erreur lors de l'extraction PDF: {ex.Message}");
                    return "";
                }
            });
        }
    }
}