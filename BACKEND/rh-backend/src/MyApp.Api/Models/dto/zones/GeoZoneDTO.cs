using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.zones
{
    public class GeoZoneDTOForm
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
    }

    public class GeoZoneSearchFiltersDTO
    {
        [MaxLength(100)]
        public string? Name { get; set; }
    }
}