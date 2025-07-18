using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.direction;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_request_details")]
    public class RecruitmentRequestDetail : BaseEntity
    {
        [Key]
        [Column("recruitment_request_detail_id")]
        public string? RecruitmentRequestDetailId { get; set; } = null!;

        [Required]
        [Column("supervisor_position")]
        [MaxLength(255)]
        public string? SupervisorPosition { get; set; }

        [Required]
        [Column("direct_supervisor_id")]
        public string? DirectSupervisorId { get; set; }

        [Required]
        [Column("service_id")]
        public string? ServiceId { get; set; }

        [Required]
        [ForeignKey("Department")]
        [Column("department_id")]
        public string? DepartmentId { get; set; }

        [Required]
        [ForeignKey("Direction")]
        [Column("direction_id")]
        public string? DirectionId { get; set; }

        [Required]
        [ForeignKey("RecruitmentRequest")]
        [Column("recruitment_request_id")]
        public string? RecruitmentRequestId { get; set; }

        // Navigation properties
        [ForeignKey("DirectSupervisorId")]
        public Employee? DirectSupervisor { get; set; }

        [ForeignKey("ServiceId")]
        public Service? Service { get; set; }

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }

        [ForeignKey("DirectionId")]
        public Direction? Direction { get; set; }

        [ForeignKey("RecruitmentRequestId")]
        public RecruitmentRequest? RecruitmentRequest { get; set; }
    }
}
