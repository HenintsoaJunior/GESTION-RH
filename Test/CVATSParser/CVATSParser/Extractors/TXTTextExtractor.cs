using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using CVATSParser.Interfaces;

namespace CVATSParser.Extractors
{
    // Extracteur pour fichiers TXT
    public class TXTTextExtractor : ITextExtractor
    {
        public async Task<string> ExtractTextAsync(string filePath)
        {
            try
            {
                return await File.ReadAllTextAsync(filePath, Encoding.UTF8);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de l'extraction TXT: {ex.Message}");
                return "";
            }
        }
    }
}