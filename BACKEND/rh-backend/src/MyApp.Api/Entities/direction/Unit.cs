using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
    }
}
