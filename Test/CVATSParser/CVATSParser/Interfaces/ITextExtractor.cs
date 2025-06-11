using System.Threading.Tasks;

namespace CVATSParser.Interfaces
{
    // Interface pour l'extraction de texte selon le format
    public interface ITextExtractor
    {
        Task<string> ExtractTextAsync(string filePath);
    }
}