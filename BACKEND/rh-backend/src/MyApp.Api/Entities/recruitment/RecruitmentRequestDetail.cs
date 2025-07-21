using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.direction;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.form.recruitment;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_request_details")]
    public class RecruitmentRequestDetail : BaseEntity
    {
        [Key]
        [Column("recruitment_request_detail_id")]
        public string? RecruitmentRequestDetailId { get; set; }

        [Required]
        [Column("supervisor_position")]
        [MaxLength(255)]
        public string SupervisorPosition { get; set; } = default!;

        [Required]
        [Column("direct_supervisor_id")]
        public string DirectSupervisorId { get; set; } = default!;

        [Required]
        [Column("service_id")]
        public string ServiceId { get; set; } = default!;

        [Required]
        [Column("department_id")]
        public string DepartmentId { get; set; } = default!;

        [Required]
        [Column("direction_id")]
        public string DirectionId { get; set; } = default!;

        [Required]
        [Column("recruitment_request_id")]
        public string RecruitmentRequestId { get; set; } = default!;

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

        public RecruitmentRequestDetail() { }

        public RecruitmentRequestDetail(RecruitmentRequestDTOForm requestForm)
        {
            SupervisorPosition = requestForm.RecruitmentRequestDetail.SupervisorPosition;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            DirectionId = requestForm.RecruitmentRequestDetail.DirectionId;
            DepartmentId = requestForm.RecruitmentRequestDetail.DepartmentId;
            ServiceId = requestForm.RecruitmentRequestDetail.ServiceId;
            DirectSupervisorId = requestForm.RecruitmentRequestDetail.DirectSupervisorId;
        }
    }
}