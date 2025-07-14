using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.direction
{
    [Table("service")]
    public class Service : BaseEntity
    {
        [Key]
        [Column("service_id")]
        [MaxLength(50)]
        public string ServiceId { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("service_name")]
        [MaxLength(255)]
        public string ServiceName { get; set; } = string.Empty;

        [Required]
        [Column("department_id")]
        [MaxLength(50)]
        public string DepartmentId { get; set; } = null!;

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }
    }
}
