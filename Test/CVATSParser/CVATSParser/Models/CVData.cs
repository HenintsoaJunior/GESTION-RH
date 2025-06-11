using System;
using System.Collections.Generic;

namespace CVATSParser.Models
{
    // Modèle pour stocker les informations extraites du CV
    public class CVData
    {
        public string NomComplet { get; set; } = "";
        public string Email { get; set; } = "";
        public string Telephone { get; set; } = "";
        public string Adresse { get; set; } = "";
        public List<string> Competences { get; set; } = new List<string>();
        public List<Experience> Experiences { get; set; } = new List<Experience>();
        public List<Formation> Formations { get; set; } = new List<Formation>();
        public List<string> Langues { get; set; } = new List<string>();
        public string Resume { get; set; } = "";
        public DateTime DateExtraction { get; set; } = DateTime.Now;
    }
}