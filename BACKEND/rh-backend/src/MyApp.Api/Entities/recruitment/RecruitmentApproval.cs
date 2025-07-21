using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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

        public static IEnumerable<RecruitmentApproval> GetRecruitmentApprovalsFromApprovalFlows(string recruitmentRequestId,IEnumerable<ApprovalFlowEmployee> approvalFlows)
        {
            var recruitmentApprovals = new List<RecruitmentApproval>();
            bool first = true;

            foreach (var flow in approvalFlows)
            {
                var approval = new RecruitmentApproval
                {
                    RecruitmentRequestId = recruitmentRequestId,
                    ApproverId = flow.EmployeeId,
                    ApprovalOrder = flow.ApprovalFlow?.ApprovalOrder,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Status = first ? "En attente" : null,
                    Comment = string.Empty
                };
                recruitmentApprovals.Add(approval);
                first = false; // seul le premier garde le statut
            }
            return recruitmentApprovals;
        }
    }
}
