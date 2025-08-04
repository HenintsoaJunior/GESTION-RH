
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
        public static List<List<string>> ReadCsv(string filePath, char dataSeparator)
        {   
            if (!File.Exists(filePath))
                throw new FileNotFoundException("Fichier CSV introuvable", filePath);

            var result = new List<List<string>>();

            foreach (var rawLine in File.ReadLines(filePath))
            {
                string line = rawLine.Trim();

                // Ignore les lignes vides
                if (string.IsNullOrWhiteSpace(line))
                    continue;

                var values = line.Split(dataSeparator);
                var row = new List<string>(values);

                // Affichage de la ligne dans la console
                Console.WriteLine($"Ligne lue : {string.Join(" | ", row)}");

                result.Add(row);
            }

            return result;
        }
    }
}
