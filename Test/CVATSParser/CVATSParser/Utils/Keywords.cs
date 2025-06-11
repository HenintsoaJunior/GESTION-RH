using System.Collections.Generic;

namespace CVATSParser.Utils
{
    public static class Keywords
    {
        public static Dictionary<string, List<string>> GetKeywords()
        {
            return new Dictionary<string, List<string>>
            {
                ["experience"] = new List<string>
                {
                    "expérience", "experience", "expériences", "experiences",
                    "professional experience", "work experience", "emploi",
                    "carrière", "poste", "fonction", "mission", "responsabilités"
                },
                ["formation"] = new List<string>
                {
                    "formation", "formations", "education", "diplôme", "diplômes",
                    "université", "école", "institut", "cursus", "études",
                    "baccalauréat", "licence", "master", "doctorat", "bts", "dut"
                },
                ["competences"] = new List<string>
                {
                    "compétences", "competences", "skills", "savoir-faire",
                    "expertise", "maîtrise", "technologies", "outils", "logiciels"
                },
                ["langues"] = new List<string>
                {
                    "langues", "languages", "langue", "language", "linguistique",
                    "anglais", "français", "espagnol", "allemand", "italien"
                }
            };
        }
    }
}