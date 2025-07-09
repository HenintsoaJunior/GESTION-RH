using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.departments
{
    [Table("direction")]
    public class Direction : BaseEntity
    {
        [Key]
        [Column("direction_id")]
        [MaxLength(50)]
        public string DirectionId { get; set; } = null!;

        [Required]
        [Column("direction_name")]
        [MaxLength(100)]
        public string DirectionName { get; set; } = null!;
    }
}