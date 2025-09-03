using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.contract;
using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.site;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.recruitment;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_requests")]
    public class RecruitmentRequest : BaseEntity
    {
        [Key]
        [Column("recruitment_request_id")]
        public string? RecruitmentRequestId { get; set; }

        [Required]
        [Column("position_title")]
        [MaxLength(255)]
        public string PositionTitle { get; set; } = default!;

        [Column("position_count")]
        public int PositionCount { get; set; } = 1;

        [Column("contract_duration")]
        [MaxLength(100)]
        public string? ContractDuration { get; set; }

        [Column("former_employee_name")]
        [MaxLength(255)]
        public string? FormerEmployeeName { get; set; }

        [Column("replacement_date")]
        public DateTime? ReplacementDate { get; set; }

        [Column("new_position_explanation")]
        public string? NewPositionExplanation { get; set; }

        [Column("desired_start_date")]
        public DateTime? DesiredStartDate { get; set; }

        [Column("status")]
        [MaxLength(10)]
        public string Status { get; set; } = "En attente";

        [Column("files")]
        public byte[]? Files { get; set; }

        [Required]
        [Column("requester_id")]
        public string RequesterId { get; set; } = default!;

        [Required]
        [Column("contract_type_id")]
        public string ContractTypeId { get; set; } = default!;

        [Required]
        [Column("site_id")]
        public string SiteId { get; set; } = default!;

        [Required]
        [Column("recruitment_reason_id")]
        public string RecruitmentReasonId { get; set; } = default!;

        // Navigation Properties
        [ForeignKey("RequesterId")]
        public User? Requester { get; set; }

        [ForeignKey("ContractTypeId")]
        public ContractType? ContractType { get; set; }

        [ForeignKey("SiteId")]
        public Site? Site { get; set; }

        [ForeignKey("RecruitmentReasonId")]
        public RecruitmentReason? RecruitmentReason { get; set; }
        
        public ICollection<RecruitmentRequestReplacementReason> RecruitmentRequestReplacementReasons { get; set; } = new List<RecruitmentRequestReplacementReason>();
        public RecruitmentRequest() { }

        public RecruitmentRequest(RecruitmentRequestDTOForm requestForm)
        {
            PositionTitle = requestForm.PositionTitle;
            PositionCount = requestForm.PositionCount;
            ContractDuration = requestForm.ContractDuration;
            FormerEmployeeName = requestForm.FormerEmployeeName;
            ReplacementDate = requestForm.ReplacementDate;
            NewPositionExplanation = requestForm.NewPositionExplanation;
            DesiredStartDate = requestForm.DesiredStartDate;
            CreatedAt = DateTime.UtcNow;
            UpdatedAt = DateTime.UtcNow;
            Status = requestForm.Status ?? "En attente";
            Files = requestForm.Files;
            RequesterId = requestForm.RequesterId;
            ContractTypeId = requestForm.ContractTypeId;
            SiteId = requestForm.SiteId;
            RecruitmentReasonId = requestForm.RecruitmentReasonId;
        }
    }
}