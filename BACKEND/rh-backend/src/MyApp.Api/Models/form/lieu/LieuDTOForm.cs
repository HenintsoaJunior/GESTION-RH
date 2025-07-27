using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.form.lieu
{
    public class LieuDTOForm
    {
        [Required(ErrorMessage = "Le nom du lieu est requis.")]
        [StringLength(100, ErrorMessage = "Le nom du lieu ne peut pas dépasser 100 caractères.")]
        public string Nom { get; set; } = string.Empty;

        [StringLength(200, ErrorMessage = "L'adresse ne peut pas dépasser 200 caractères.")]
        public string? Adresse { get; set; }

        [StringLength(100, ErrorMessage = "La ville ne peut pas dépasser 100 caractères.")]
        public string? Ville { get; set; }

        [StringLength(20, ErrorMessage = "Le code postal ne peut pas dépasser 20 caractères.")]
        public string? CodePostal { get; set; }

        [Required(ErrorMessage = "Le pays est requis.")]
        [StringLength(100, ErrorMessage = "Le pays ne peut pas dépasser 100 caractères.")]
        public string? Pays { get; set; }
    }
}