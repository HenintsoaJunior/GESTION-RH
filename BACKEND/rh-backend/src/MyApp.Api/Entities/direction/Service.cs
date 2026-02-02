using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.direction;

namespace MyApp.Api.Entities.direction
{
    [Table("service")]
    public class Service : BaseEntity
    {
        [Key]
        [Column("service_id")]
        [MaxLength(50)]
        public string ServiceId { get; set; } = null!;

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

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        public Service()
        {
        }

        public Service(ServiceDTOForm dto)
        {
            ServiceName = dto.ServiceName ?? throw new ArgumentNullException(nameof(dto.ServiceName));
            DepartmentId = dto.DepartmentId ?? throw new ArgumentNullException(nameof(dto.DepartmentId));
        }
    }
}