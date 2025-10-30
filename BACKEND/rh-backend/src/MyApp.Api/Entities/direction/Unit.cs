using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.direction;

namespace MyApp.Api.Entities.direction
{
    [Table("units")]
    public class Unit : BaseEntity
    {
        [Key]
        [Column("unit_id")]
        [MaxLength(50)]
        public string UnitId { get; set; } = null!;

        [Required]
        [Column("unit_name")]
        [MaxLength(100)]
        public string UnitName { get; set; } = string.Empty;

        [Required]
        [Column("service_id")]
        [MaxLength(50)]
        public string ServiceId { get; set; } = null!;

        [ForeignKey("ServiceId")]
        public Service? Service { get; set; }

        public Unit()
        {
        }

        public Unit(UnitDTOForm dto)
        {
            UnitName = dto.UnitName ?? throw new ArgumentNullException(nameof(dto.UnitName));
            ServiceId = dto.ServiceId ?? throw new ArgumentNullException(nameof(dto.ServiceId));
        }
    }
}