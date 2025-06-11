using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Newtonsoft.Json;
using CVATSParser.Interfaces;
using CVATSParser.Extractors;
using CVATSParser.Models;
using CVATSParser.Utils;

namespace CVATSParser.Services
{
    // Classe principale pour le parsing des CV
    public class CVParser
    {
        private readonly Dictionary<string, ITextExtractor> _extractors;
        private readonly Dictionary<string, List<string>> _keywords;

        public CVParser()
        {
            _extractors = new Dictionary<string, ITextExtractor>
            {
                { ".pdf", new PDFTextExtractor() },
                { ".docx", new DOCXTextExtractor() },
                { ".txt", new TXTTextExtractor() }
            };

            _keywords = Keywords.GetKeywords();
        }

        public async Task<CVData> ParseCVAsync(string filePath)
        {
            if (!File.Exists(filePath))
            {
                throw new FileNotFoundException($"Le fichier {filePath} n'existe pas.");
            }

            var extension = Path.GetExtension(filePath).ToLower();
            if (!_extractors.ContainsKey(extension))
            {
                throw new NotSupportedException($"Format de fichier non supporté: {extension}");
            }

            var text = await _extractors[extension].ExtractTextAsync(filePath);
            return ParseText(text);
        }

        private CVData ParseText(string text)
        {
            var cvData = new CVData();
            var lines = text.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                           .Select(line => line.Trim())
                           .Where(line => !string.IsNullOrEmpty(line))
                           .ToList();

            // Extraction des informations de base
            cvData.NomComplet = ExtractName(lines);
            cvData.Email = ExtractEmail(text);
            cvData.Telephone = ExtractPhone(text);
            cvData.Adresse = ExtractAddress(text);

            // Extraction des sections structurées
            cvData.Experiences = ExtractExperiences(text, lines);
            cvData.Formations = ExtractFormations(text, lines);
            cvData.Competences = ExtractCompetences(text, lines);
            cvData.Langues = ExtractLangues(text, lines);
            cvData.Resume = ExtractResume(text, lines);

            return cvData;
        }

        private string ExtractName(List<string> lines)
        {
            // Le nom est généralement dans les premières lignes
            for (int i = 0; i < Math.Min(5, lines.Count); i++)
            {
                var line = lines[i];
                // Éviter les lignes qui contiennent des emails ou des numéros
                if (!Regex.IsMatch(line, @"[@\d]") && line.Length > 2 && line.Length < 50)
                {
                    // Vérifier si c'est un nom (contient des lettres et éventuellement des espaces)
                    if (Regex.IsMatch(line, @"^[A-Za-zÀ-ÿ\s\-'\.]+$"))
                    {
                        return line.Trim();
                    }
                }
            }
            return "Non détecté";
        }

        private string ExtractEmail(string text)
        {
            var emailPattern = @"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b";
            var match = Regex.Match(text, emailPattern);
            return match.Success ? match.Value : "Non détecté";
        }

        private string ExtractPhone(string text)
        {
            var phonePatterns = new[]
            {
                @"(?:\+\d{1,3}\s?)?\(?\d{2,4}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{0,4}",
                @"(?:\+33|0)\s?[1-9](?:[\s.-]?\d{2}){4}",
                @"\+?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,4}"
            };

            foreach (var pattern in phonePatterns)
            {
                var match = Regex.Match(text, pattern);
                if (match.Success && match.Value.Replace(" ", "").Replace("-", "").Replace(".", "").Length >= 8)
                {
                    return match.Value.Trim();
                }
            }
            return "Non détecté";
        }

        private string ExtractAddress(string text)
        {
            var addressPattern = @"\d+[\s,]+[A-Za-zÀ-ÿ\s\-'\.]+(?:\d{5})?[\s,]+[A-Za-zÀ-ÿ\s\-'\.]+";
            var match = Regex.Match(text, addressPattern);
            return match.Success ? match.Value.Trim() : "Non détecté";
        }

        private List<Experience> ExtractExperiences(string text, List<string> lines)
        {
            var experiences = new List<Experience>();
            var experienceSection = FindSection(text, lines, "experience");
            
            if (string.IsNullOrEmpty(experienceSection))
                return experiences;

            var experienceLines = experienceSection.Split('\n')
                .Where(line => !string.IsNullOrWhiteSpace(line))
                .ToList();

            Experience currentExp = null;
            foreach (var line in experienceLines)
            {
                var trimmedLine = line.Trim();
                
                // Détecter une nouvelle expérience (contient des dates)
                if (Regex.IsMatch(trimmedLine, @"\d{4}"))
                {
                    if (currentExp != null)
                        experiences.Add(currentExp);
                    
                    currentExp = new Experience();
                    
                    // Extraire la période
                    var dateMatch = Regex.Match(trimmedLine, @"\d{4}[-–]\d{4}|\d{4}[-–]present|\d{4}[-–]aujourd'hui|\d{4}");
                    if (dateMatch.Success)
                    {
                        currentExp.Periode = dateMatch.Value;
                        var remaining = trimmedLine.Replace(dateMatch.Value, "").Trim();
                        
                        // Le reste peut contenir le poste et l'entreprise
                        var parts = remaining.Split(new[] { " chez ", " at ", " - " }, StringSplitOptions.RemoveEmptyEntries);
                        if (parts.Length >= 2)
                        {
                            currentExp.Poste = parts[0].Trim();
                            currentExp.Entreprise = parts[1].Trim();
                        }
                        else
                        {
                            currentExp.Poste = remaining;
                        }
                    }
                }
                else if (currentExp != null)
                {
                    // Ajouter à la description
                    if (!string.IsNullOrEmpty(currentExp.Description))
                        currentExp.Description += " ";
                    currentExp.Description += trimmedLine;
                }
            }
            
            if (currentExp != null)
                experiences.Add(currentExp);

            return experiences;
        }

        private List<Formation> ExtractFormations(string text, List<string> lines)
        {
            var formations = new List<Formation>();
            var formationSection = FindSection(text, lines, "formation");
            
            if (string.IsNullOrEmpty(formationSection))
                return formations;

            var formationLines = formationSection.Split('\n')
                .Where(line => !string.IsNullOrWhiteSpace(line))
                .ToList();

            Formation currentFormation = null;
            foreach (var line in formationLines)
            {
                var trimmedLine = line.Trim();
                
                // Détecter une nouvelle formation (contient des dates)
                if (Regex.IsMatch(trimmedLine, @"\d{4}"))
                {
                    if (currentFormation != null)
                        formations.Add(currentFormation);
                    
                    currentFormation = new Formation();
                    
                    // Extraire l'année
                    var yearMatch = Regex.Match(trimmedLine, @"\d{4}");
                    if (yearMatch.Success)
                    {
                        currentFormation.Annee = yearMatch.Value;
                        var remaining = trimmedLine.Replace(yearMatch.Value, "").Trim();
                        
                        // Le reste contient le diplôme et l'école
                        var parts = remaining.Split(new[] { " - ", " à ", " at " }, StringSplitOptions.RemoveEmptyEntries);
                        if (parts.Length >= 2)
                        {
                            currentFormation.Diplome = parts[0].Trim();
                            currentFormation.Ecole = parts[1].Trim();
                        }
                        else
                        {
                            currentFormation.Diplome = remaining;
                        }
                    }
                }
                else if (currentFormation != null && string.IsNullOrEmpty(currentFormation.Ecole))
                {
                    currentFormation.Ecole = trimmedLine;
                }
            }
            
            if (currentFormation != null)
                formations.Add(currentFormation);

            return formations;
        }

        private List<string> ExtractCompetences(string text, List<string> lines)
        {
            var competences = new List<string>();
            var competenceSection = FindSection(text, lines, "competences");
            
            if (string.IsNullOrEmpty(competenceSection))
                return competences;

            var competenceLines = competenceSection.Split('\n')
                .Where(line => !string.IsNullOrWhiteSpace(line))
                .ToList();

            foreach (var line in competenceLines)
            {
                var trimmedLine = line.Trim();
                
                // Séparer par virgules, points-virgules ou tirets
                var skills = trimmedLine.Split(new[] { ',', ';', '•', '-', '▪' }, StringSplitOptions.RemoveEmptyEntries);
                
                foreach (var skill in skills)
                {
                    var cleanSkill = skill.Trim();
                    if (!string.IsNullOrEmpty(cleanSkill) && cleanSkill.Length > 1)
                    {
                        competences.Add(cleanSkill);
                    }
                }
            }

            return competences.Distinct().ToList();
        }

        private List<string> ExtractLangues(string text, List<string> lines)
        {
            var langues = new List<string>();
            var langueSection = FindSection(text, lines, "langues");
            
            if (string.IsNullOrEmpty(langueSection))
                return langues;

            var langueLines = langueSection.Split('\n')
                .Where(line => !string.IsNullOrWhiteSpace(line))
                .ToList();

            foreach (var line in langueLines)
            {
                var trimmedLine = line.Trim();
                
                // Extraire les langues avec leur niveau
                var languagePattern = @"(Français|Anglais|Espagnol|Allemand|Italien|Arabe|Chinois|Japonais|Portugais|Russe|Malagasy|French|English|Spanish|German|Italian|Arabic|Chinese|Japanese|Portuguese|Russian|Malagasy)";
                var matches = Regex.Matches(trimmedLine, languagePattern, RegexOptions.IgnoreCase);
                
                foreach (Match match in matches)
                {
                    var langue = match.Value;
                    
                    // Essayer d'extraire le niveau
                    var niveauMatch = Regex.Match(trimmedLine, @"(A1|A2|B1|B2|C1|C2|débutant|intermédiaire|avancé|courant|natif|bilingue|beginner|intermediate|advanced|fluent|native)", RegexOptions.IgnoreCase);
                    
                    if (niveauMatch.Success)
                    {
                        langue += " (" + niveauMatch.Value + ")";
                    }
                    
                    langues.Add(langue);
                }
            }

            return langues.Distinct().ToList();
        }

        private string ExtractResume(string text, List<string> lines)
        {
            var resumeKeywords = new[] { "résumé", "resume", "profil", "profile", "objectif", "objective", "à propos", "about" };
            
            foreach (var keyword in resumeKeywords)
            {
                var resumeSection = FindSection(text, lines, keyword);
                if (!string.IsNullOrEmpty(resumeSection))
                {
                    return resumeSection.Replace(keyword, "").Trim();
                }
            }
            
            // Si aucune section résumé n'est trouvée, prendre les premières lignes après le nom
            var nameFound = false;
            var resumeLines = new List<string>();
            
            foreach (var line in lines.Take(10))
            {
                if (!nameFound && !line.Contains("@") && !Regex.IsMatch(line, @"\d"))
                {
                    nameFound = true;
                    continue;
                }
                
                if (nameFound && !line.Contains("@") && !Regex.IsMatch(line, @"^\d"))
                {
                    resumeLines.Add(line);
                    if (resumeLines.Count >= 3) break;
                }
            }
            
            return string.Join(" ", resumeLines);
        }

        private string FindSection(string text, List<string> lines, string sectionType)
        {
            if (!_keywords.ContainsKey(sectionType))
                return "";

            var keywords = _keywords[sectionType];
            var sectionContent = new List<string>();
            var inSection = false;
            var sectionStartIndex = -1;

            for (int i = 0; i < lines.Count; i++)
            {
                var line = lines[i].ToLower();
                
                // Vérifier si cette ligne contient un mot-clé de section
                if (keywords.Any(keyword => line.Contains(keyword.ToLower())))
                {
                    inSection = true;
                    sectionStartIndex = i;
                    continue;
                }
                
                // Si on est dans une section, ajouter le contenu
                if (inSection)
                {
                    // Vérifier si on arrive à une nouvelle section
                    var isNewSection = _keywords.Values.Any(keywordList => 
                        keywordList.Any(keyword => line.Contains(keyword.ToLower())));
                    
                    if (isNewSection && i > sectionStartIndex + 1)
                    {
                        break;
                    }
                    
                    sectionContent.Add(lines[i]);
                }
            }

            return string.Join("\n", sectionContent);
        }

        public void SaveToJson(CVData cvData, string outputPath)
        {
            var json = JsonConvert.SerializeObject(cvData, Formatting.Indented);
            File.WriteAllText(outputPath, json);
        }

        public void SaveToCsv(List<CVData> cvDataList, string outputPath)
        {
            var csv = new StringBuilder();
            csv.AppendLine("Nom,Email,Téléphone,Adresse,Compétences,Expériences,Formations,Langues,Date Extraction");
            
            foreach (var cv in cvDataList)
            {
                csv.AppendLine($"\"{cv.NomComplet}\",\"{cv.Email}\",\"{cv.Telephone}\",\"{cv.Adresse}\"," +
                              $"\"{string.Join("; ", cv.Competences)}\",\"{cv.Experiences.Count} expériences\"," +
                              $"\"{cv.Formations.Count} formations\",\"{string.Join("; ", cv.Langues)}\"," +
                              $"\"{cv.DateExtraction:yyyy-MM-dd HH:mm:ss}\"");
            }
            
            File.WriteAllText(outputPath, csv.ToString());
        }
    }
}