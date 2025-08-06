
using System.Globalization;
using System.Text;

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

        public static List<List<string>> ReadCsv(Stream fileStream, char dataSeparator)
        {
            var result = new List<List<string>>();
            // Lire directement depuis le stream sans écrire sur le disque
            using var reader = new StreamReader(fileStream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true, leaveOpen: false);
            while (!reader.EndOfStream)
            {
                var line = reader.ReadLine();
                if (line == null) continue;
                var row = line.Split(dataSeparator).Select(cell => cell.Trim()).ToList();
                result.Add(row);
            }
            // Log : afficher chaque cellule avec son index
            for (int i = 0; i < result.Count; i++)
            {
                for (int j = 0; j < result[i].Count; j++)
                {
                    Console.WriteLine($"data[{i}][{j}] = {result[i][j]}");
                }
            }
            return result;
        }

        /// prendre un bloc de donnees
        public static List<List<string>> ExtractBlock(List<List<string>> dataExcel, int blockNumber)
        {
            if (blockNumber <= 0)
                throw new ArgumentException("Le numéro de bloc doit être supérieur ou égal à 1.");

            int currentBlock = 0;
            bool inBlock = false;
            var currentBlockRows = new List<List<string>>();

            for (int i = 1; i < dataExcel.Count; i++) // On saute l'entête (ligne 0)
            {
                var row = dataExcel[i];
                bool isEmpty = row.All(cell => string.IsNullOrWhiteSpace(cell));

                if (!isEmpty)
                {
                    if (!inBlock)
                    {
                        currentBlock++;
                        inBlock = true;
                    }

                    if (currentBlock == blockNumber)
                    {
                        currentBlockRows.Add(row);
                    }
                }
                else
                {
                    inBlock = false;
                }

                if (currentBlock > blockNumber)
                {
                    break; // plus besoin de continuer une fois le bloc trouvé
                }
            }

            return currentBlockRows;
        }

        // compte les blocs de données séparés par " "
        public static int CountDataBlocks(List<List<string>> data)
        {
            int blockCount = 0;
            bool inBlock = false;

            for (int i = 1; i < data.Count; i++) // skip header (index 0)
            {
                var row = data[i];

                // Ligne vide = nouveau bloc
                bool isEmpty = row.All(cell => string.IsNullOrWhiteSpace(cell));

                if (!isEmpty)
                {
                    if (!inBlock)
                    {
                        blockCount++;
                        inBlock = true;
                    }
                }
                else
                {
                    inBlock = false;
                }
            }

            return blockCount;
        }

       public static List<string>? CheckHour(List<List<string>> data)
        {
            if (data == null || data.Count < 2)
                return null;

            var errors = new List<string>();
            var header = data[0];
            var hourColIndex = GetColumnIndex(header, "heure", "hour", "time");

            if (hourColIndex == -1)
                return new List<string> { "Colonne d'heure introuvable." };

            TimeSpan? previousTime = null;

            for (int i = 1; i < data.Count; i++)
            {
                var row = data[i];

                if (row.Count <= hourColIndex)
                {
                    errors.Add($"{i + 1}:{hourColIndex + 1} => Colonne manquante.");
                    continue;
                }

                var timeString = row[hourColIndex];

                // Ignorer si l'heure est vide ou null
                if (string.IsNullOrWhiteSpace(timeString))
                    continue;

                if (!TryParseHour(timeString, out TimeSpan currentTime))
                {
                    errors.Add($"{i + 1}:{hourColIndex + 1} => Heure invalide : '{timeString}'");
                    continue;
                }

                if (previousTime.HasValue && currentTime < previousTime.Value)
                {
                    errors.Add($"{i + 1}:{hourColIndex + 1} => Heure non ordonnée : {currentTime:hh\\:mm} < {previousTime.Value:hh\\:mm}");
                }

                previousTime = currentTime;
            }

            return errors.Count > 0 ? errors : null;
        }



        public static List<string>? CheckDate(List<List<string>> data)
        {
            if (data == null || data.Count < 2)
                return null;

            var errors = new List<string>();
            var header = data[0];
            var dateColIndex = GetColumnIndex(header, "date", "jour", "day");

            if (dateColIndex == -1)
                return new List<string> { "Colonne de date introuvable." };

            DateTime? previousDate = null;

            for (int i = 1; i < data.Count; i++)
            {
                var row = data[i];
                if (row.Count <= dateColIndex)
                {
                    errors.Add($"{i+1}:{dateColIndex + 1} => Colonne manquante.");
                    continue;
                }

                var dateString = row[dateColIndex];

                if (!TryParseDate(dateString, out DateTime currentDate))
                {
                    errors.Add($"{i+1}:{dateColIndex + 1} => Date invalide : '{dateString}'");
                    continue;
                }

                if (previousDate.HasValue && currentDate < previousDate.Value)
                {
                    errors.Add($"{i+1}:{dateColIndex + 1} => Date non ordonnée : {currentDate:yyyy-MM-dd} < {previousDate.Value:yyyy-MM-dd}");
                }

                previousDate = currentDate;
            }

            return errors.Count > 0 ? errors : null;
        }

        private static bool TryParseHour(string input, out TimeSpan time)
        {
            return TimeSpan.TryParseExact(
                input.Trim(),
                new[] { "hh\\:mm", "h\\:mm", "HH\\:mm", "H\\:mm" },
                CultureInfo.InvariantCulture,
                out time
            );
        }

        private static bool TryParseDate(string input, out DateTime date)
        {
            string[] formats = {
                "yyyy-MM-dd",
                "dd/MM/yyyy",
                "MM/dd/yyyy",
                "dd-MM-yyyy",
                "yyyy/MM/dd",
                "dd MMM yyyy"
            };

            return DateTime.TryParseExact(
                input.Trim(),
                formats,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out date
            );
        }



        public static bool HasMinimumRows(List<List<string>> data)
        {
            return data != null && data.Count >= 2;
        }

        public static int GetColumnIndex(List<string> header, params string[] keywords)
        {
            for (int i = 0; i < header.Count; i++)
            {
                string column = header[i].Trim().ToLower();
                foreach (var keyword in keywords)
                {
                    if (column.Contains(keyword.ToLower()))
                        return i;
                }
            }
            return -1;
        }

        public static bool HasSufficientColumns(List<string> row, int nameIndex, int codeIndex)
        {
            return row.Count > Math.Max(nameIndex, codeIndex);
        }

        public static void ValidatePresence(string value, string label, int rowIndex, int colIndex, List<string> errors)
        {
            if (string.IsNullOrWhiteSpace(value))
                errors.Add($"{rowIndex}:{colIndex + 1} => {label} manquant.");
        }

        public static void CheckDuplicate(Dictionary<string, string> map, string code, string name, int rowIndex, int colIndex, List<string> errors)
        {
            if (string.IsNullOrWhiteSpace(code)) return;

            if (map.TryGetValue(code, out var existingName))
            {
                if (!string.Equals(existingName, name, StringComparison.OrdinalIgnoreCase))
                {
                    errors.Add($"{rowIndex}:{colIndex + 1} => Conflit : le code '{code}' est déjà associé au nom '{existingName}' (nouveau: '{name}').");
                }
            }
            else
            {
                map[code] = name;
            }
        }
    }
}
