using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CVATSParser.Services;

namespace CVATSParser
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var parser = new CVParser();
            
            try
            {
                // Exemple d'utilisation
                Console.WriteLine("=== SYSTÈME DE PARSING CV ATS ===");
                Console.WriteLine("Formats supportés: PDF, DOCX, TXT");
                Console.WriteLine();
                
                if (args.Length == 0)
                {
                    Console.WriteLine("Usage: CVATSParser.exe <chemin_vers_cv>");
                    Console.WriteLine("Exemple: CVATSParser.exe \"C:\\CVs\\cv_candidat.pdf\"");
                    return;
                }
                
                string cvPath = args[0];
                Console.WriteLine($"Analyse du CV: {cvPath}");
                Console.WriteLine("Traitement en cours...");
                
                var cvData = await parser.ParseCVAsync(cvPath);
                
                // Affichage des résultats
                Console.WriteLine("\n=== RÉSULTATS DE L'ANALYSE ===");
                Console.WriteLine($"Nom: {cvData.NomComplet}");
                Console.WriteLine($"Email: {cvData.Email}");
                Console.WriteLine($"Téléphone: {cvData.Telephone}");
                Console.WriteLine($"Adresse: {cvData.Adresse}");
                
                Console.WriteLine($"\nCompétences ({cvData.Competences.Count}):");
                foreach (var competence in cvData.Competences.Take(10))
                {
                    Console.WriteLine($"  • {competence}");
                }
                
                Console.WriteLine($"\nExpériences ({cvData.Experiences.Count}):");
                foreach (var exp in cvData.Experiences.Take(3))
                {
                    Console.WriteLine($"  • {exp.Periode} - {exp.Poste} chez {exp.Entreprise}");
                }
                
                Console.WriteLine($"\nFormations ({cvData.Formations.Count}):");
                foreach (var formation in cvData.Formations.Take(3))
                {
                    Console.WriteLine($"  • {formation.Annee} - {formation.Diplome} - {formation.Ecole}");
                }
                
                Console.WriteLine($"\nLangues ({cvData.Langues.Count}):");
                foreach (var langue in cvData.Langues)
                {
                    Console.WriteLine($"  • {langue}");
                }
                
                // Sauvegarde en JSON
                var jsonPath = Path.ChangeExtension(cvPath, ".json");
                parser.SaveToJson(cvData, jsonPath);
                Console.WriteLine($"\nRésultats sauvegardés en JSON: {jsonPath}");
                
                Console.WriteLine("\nAnalyse terminée avec succès!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur: {ex.Message}");
            }
        }
    }
}