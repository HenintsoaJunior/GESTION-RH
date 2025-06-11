using System;
using System.Threading.Tasks;
using DocumentFormat.OpenXml.Packaging;
using CVATSParser.Interfaces;

namespace CVATSParser.Extractors
{
    // Extracteur pour fichiers DOCX
    public class DOCXTextExtractor : ITextExtractor
    {
        public async Task<string> ExtractTextAsync(string filePath)
        {
            return await Task.Run(() =>
            {
                try
                {
                    using (var document = WordprocessingDocument.Open(filePath, false))
                    {
                        var body = document.MainDocumentPart.Document.Body;
                        return body.InnerText;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erreur lors de l'extraction DOCX: {ex.Message}");
                    return "";
                }
            });
        }
    }
}