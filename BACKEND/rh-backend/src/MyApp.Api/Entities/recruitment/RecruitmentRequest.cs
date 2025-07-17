using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.contract;
using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.site;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_requests")]
    public class RecruitmentRequest : BaseEntity
    {
        [Column("recruitment_request_id")]
        public string ? RecruitmentRequestId { get; set; }

        [Column("position_title")]
        [Required]
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

        [Column("requester_id")]
        [Required]
        public string RequesterId { get; set; } = default!;

        [Column("contract_type_id")]
        [Required]
        public string ContractTypeId { get; set; } = default!;

        [Column("site_id")]
        [Required]
        public string SiteId { get; set; } = default!;

        [Column("recruitment_reason_id")]
        [Required]
        public string RecruitmentReasonId { get; set; } = default!;

        // Navigation Properties (si elles existent dans le modèle)
        [ForeignKey("RequesterId")]
        public User? Requester { get; set; }

        [ForeignKey("ContractTypeId")]
        public ContractType? ContractType { get; set; }

        [ForeignKey("SiteId")]
        public Site? Site { get; set; }

        [ForeignKey("RecruitmentReasonId")]
        public RecruitmentReason? RecruitmentReason { get; set; }

        public RecruitmentRequestDetail RecruitmentRequestDetail { get; set; } = null!;
        public RecruitmentApproval RecruitmentApproval { get; set; } = null!;
        public IEnumerable<RecruitmentRequestReplacementReason>? ReplacementReasons { get; set; } = null;
        public IEnumerable<ApprovalFlow>? ApprovalFlows { get; set; } = null;
    }
}
