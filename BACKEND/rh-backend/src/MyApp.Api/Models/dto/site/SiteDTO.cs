using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.site
{
    public class CreateSiteDTO
    {
        [Required]
        [MaxLength(255)]
        public string SiteName { get; set; } = string.Empty;

        [MaxLength(10)]
        public string? Code { get; set; }

        public decimal? Longitude { get; set; }

        public decimal? Latitude { get; set; }
    }
}