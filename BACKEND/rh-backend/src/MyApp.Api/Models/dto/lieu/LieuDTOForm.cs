using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.lieu
{
    public class LieuDTOForm
    {
        [Required(ErrorMessage = "Le nom du lieu est requis.")]
        [StringLength(255, ErrorMessage = "Le nom du lieu ne peut pas dépasser 255 caractères.")]
        public string Nom { get; set; } = string.Empty;

        [StringLength(255, ErrorMessage = "La ville ne peut pas dépasser 255 caractères.")]
        public string? Ville { get; set; }

        [StringLength(20, ErrorMessage = "Le code postal ne peut pas dépasser 20 caractères.")]
        public string? CodePostal { get; set; }

        [Required(ErrorMessage = "Le pays est requis.")]
        [StringLength(255, ErrorMessage = "Le pays ne peut pas dépasser 255 caractères.")]
        public string Pays { get; set; } = string.Empty;
        public decimal Longitude { get; set; }
        public decimal Latitude { get; set; }

        [Required(ErrorMessage = "Le zone est requis.")]
        [StringLength(50, ErrorMessage = "L'ID de la zone ne peut pas dépasser 50 caractères.")]
        public string? ZoneId { get; set; }
    }
    
    public class LieuSearchFiltersDTO
    {
        public string? Nom { get; set; }
        public string? Ville { get; set; }
        public string? Pays { get; set; }
        public string? ZoneId { get; set; }
    }
}