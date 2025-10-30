using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.tmp
{
    public class TmpEmployeeFormDTO
    {

        public string? Site { get; set; }

        public string? Mle { get; set; }

        [Required(ErrorMessage = "Nom is required")]
        public string Nom { get; set; } = string.Empty;

        public string? Prenom { get; set; }

        public string? Sexe { get; set; }

        public string? Nationalite { get; set; }

        public string? Telephone { get; set; }

        public DateTime? DateAnciennete { get; set; }

        public string? TypeContrat { get; set; }

        public string? IntitulePoste { get; set; }

        public string? Categorie { get; set; }

        public string? Unite { get; set; }

        public string? Service { get; set; }

        public string? Department { get; set; }

        public string? Direction { get; set; }

        public DateTime? DateFinContrat { get; set; }
    }
}