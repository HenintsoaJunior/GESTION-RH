using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.departments
{
    [Table("departments")]
    public class Department : BaseEntity
    {
        [Key]
        [Column("department_id")]
        [MaxLength(50)]
        public string DepartmentId { get; set; } = null!;

        [Required]
        [Column("department_name")]
        [MaxLength(100)]
        public string DepartmentName { get; set; } = null!;
    }
}