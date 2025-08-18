using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.direction
{
    [Table("direction")]
    public class Direction : BaseEntity
    {
        [Key]
        [Column("direction_id")]
        [MaxLength(50)]
        public string DirectionId { get; set; } = null!;

        [Column("direction_name")]
        [MaxLength(100)]
        [Required]
        public string DirectionName { get; set; } = string.Empty;

        [Column("acronym")]
        [MaxLength(20)]
        public string? Acronym { get; set; }
    }
}
