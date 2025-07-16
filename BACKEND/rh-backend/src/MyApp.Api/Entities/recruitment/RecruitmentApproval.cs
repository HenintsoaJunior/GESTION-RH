using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_approval")]
    public class RecruitmentApproval : BaseEntity
    {
        [Key, Column("recruitment_request_id", Order = 0)]
        [Required]
        public string RecruitmentRequestId { get; set; } = string.Empty;

        [Column("approver_id", Order = 1)]
        [Required]
        public string ApproverId { get; set; } = string.Empty;

        [Column("approval_flow_id", Order = 2)]
        [Required]
        public string ApprovalFlowId { get; set; } = string.Empty;

        [Column("status")]
        [MaxLength(50)]
        public string? Status { get; set; }

        [Column("approval_order")]
        public int? ApprovalOrder { get; set; }

        [Column("approval_date")]
        public DateTime? ApprovalDate { get; set; }

        [Column("comment")]
        public string? Comment { get; set; }

        [Column("signature")]
        public byte[]? Signature { get; set; }

        // Navigations
        [ForeignKey("RecruitmentRequestId")]
        public RecruitmentRequest? RecruitmentRequest { get; set; }

        [ForeignKey("ApproverId")]
        public User? Approver { get; set; }

        [ForeignKey("ApprovalFlowId")]
        public ApprovalFlow? ApprovalFlow { get; set; }
    }
}
