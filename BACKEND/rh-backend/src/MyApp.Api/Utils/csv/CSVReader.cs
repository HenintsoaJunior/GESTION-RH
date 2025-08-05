
namespace MyApp.Utils.csv
{
    public class CSVReader
    {
        /// <summary>
        /// Lit un fichier CSV et retourne une liste de lignes, chaque ligne étant une liste de champs (séparés par dataSeparator).
        /// </summary>
        /// <param name="filePath">Chemin vers le fichier CSV</param>
        /// <param name="dataSeparator">Caractère séparateur de colonnes (ex: ',' ou ';')</param>
        /// <returns>Liste de lignes, chaque ligne étant une liste de champs</returns>
        public static List<List<string>> ReadCsv(Stream fileStream, char separator)
        {   
            var result = new List<List<string>>();

            using (var reader = new StreamReader(fileStream))
            {
                string? line;
                while ((line = await reader.ReadLineAsync()) != null)
                {
                    if (string.IsNullOrWhiteSpace(line))
                        continue;

                    var values = line.Split(separator).Select(v => v.Trim()).ToList();
                    Console.WriteLine($"Ligne : {string.Join(" | ", values)}"); // Print
                    result.Add(values);
                }
        }
    }
}
