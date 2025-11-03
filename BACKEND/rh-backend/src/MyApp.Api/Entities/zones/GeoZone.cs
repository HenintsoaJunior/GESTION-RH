using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.zones;

namespace MyApp.Api.Entities.zones
{
    [Table("geo_zones")]
    public class GeoZone : BaseEntity
    {
        [Key]
        [Column("zone_id")]
        [MaxLength(50)]
        public string ZoneId { get; set; } = null!;

        [Column("name")]
        [MaxLength(100)]
        [Required]
        public string Name { get; set; } = string.Empty;

        public GeoZone()
        {
        }

        public GeoZone(GeoZoneDTOForm dto)
        {
            Name = dto.Name ?? throw new ArgumentNullException(nameof(dto.Name));
        }
    }
}