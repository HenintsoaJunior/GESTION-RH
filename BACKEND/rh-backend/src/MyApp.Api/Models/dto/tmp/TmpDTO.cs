using System;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.tmp
{
    public class TmpEmployeeFormDTO
    {
        public string? Site { get; set; }

        public string? Mle { get; set; }

        [Required(ErrorMessage = "Le nom est obligatoire.")]
        [MaxLength(100, ErrorMessage = "Le nom ne peut pas dépasser 100 caractères.")]
        public string Nom { get; set; } = string.Empty;

        [MaxLength(100, ErrorMessage = "Le prénom ne peut pas dépasser 100 caractères.")]
        public string? Prenom { get; set; }

        [MaxLength(50)]
        public string? Sexe { get; set; }

        [MaxLength(50)]
        public string? Nationalite { get; set; }

        [MaxLength(20)]
        [Phone(ErrorMessage = "Le numéro de téléphone n’est pas valide.")]
        public string? Telephone { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateNaissance { get; set; }

        [MaxLength(100)]
        public string? LieuNaissance { get; set; }

        [MaxLength(50)]
        public string? NumeroCin { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateCin { get; set; }

        [MaxLength(100)]
        public string? LieuCin { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateAnciennete { get; set; }

        [MaxLength(50)]
        public string? TypeContrat { get; set; }

        [MaxLength(100)]
        public string? IntitulePoste { get; set; }

        [MaxLength(50)]
        public string? Categorie { get; set; }

        [MaxLength(100)]
        public string? Unite { get; set; }

        [MaxLength(100)]
        public string? Service { get; set; }

        [MaxLength(100)]
        public string? Department { get; set; }

        [MaxLength(100)]
        public string? Direction { get; set; }

        [DataType(DataType.Date)]
        public DateTime? DateFinContrat { get; set; }
    }
}
