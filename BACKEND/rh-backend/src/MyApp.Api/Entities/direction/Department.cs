using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.direction;

namespace MyApp.Api.Entities.direction
{
    [Table("department")]
    public class Department : BaseEntity
    {
        [Key]
        [Column("department_id")]
        [MaxLength(50)]
        public string DepartmentId { get; set; } = null!;

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

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        public Department()
        {
        }

        public Department(DepartmentDTOForm dto)
        {
            DepartmentName = dto.DepartmentName ?? throw new ArgumentNullException(nameof(dto.DepartmentName));
            DirectionId = dto.DirectionId ?? throw new ArgumentNullException(nameof(dto.DirectionId));
        }

        
    }
}