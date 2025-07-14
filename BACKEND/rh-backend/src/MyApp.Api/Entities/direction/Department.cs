using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.direction
{
    [Table("department")]
    public class Department : BaseEntity
    {
        [Key]
        [Column("department_id")]
        [MaxLength(50)]
        public string DepartmentId { get; set; } = Guid.NewGuid().ToString();

        [Column("department_name")]
        [MaxLength(255)]
        [Required]
        public string DepartmentName { get; set; } = string.Empty;

        [Column("direction_id")]
        [MaxLength(50)]
        [Required]
        public string DirectionId { get; set; } = null!;

        [ForeignKey("DirectionId")]
        public Direction? Direction { get; set; }
    }
}
