using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.direction;

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

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        public Direction()
        {
        }

        public Direction(DirectionDTOForm dto)
        {
            DirectionName = dto.DirectionName ?? throw new ArgumentNullException(nameof(dto.DirectionName));
            Acronym = dto.Acronym;
        }
    }
}