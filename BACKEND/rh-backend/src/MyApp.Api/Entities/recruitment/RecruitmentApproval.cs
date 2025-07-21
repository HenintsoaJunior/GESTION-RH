using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_approval")]
    [PrimaryKey(nameof(RecruitmentRequestId), nameof(ApproverId))]
    public class RecruitmentApproval : BaseEntity
    {
        [Column("recruitment_request_id", Order = 0)]
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

        public static IEnumerable<RecruitmentApproval> GetRecruitmentApprovalsFromApprovalFlows(string recruitmentRequestId, IEnumerable<ApprovalFlowEmployee> approvalFlows)
        {
            var recruitmentApprovals = new List<RecruitmentApproval>();
            var seenApprovers = new HashSet<string>();
            bool first = true;

            foreach (var flow in approvalFlows)
            {
                if (flow?.EmployeeId == null || seenApprovers.Contains(flow.EmployeeId))
                {
                    Console.WriteLine($"Doublon ou EmployeeId null détecté pour RecruitmentRequestId={recruitmentRequestId}, EmployeeId={flow?.EmployeeId}");
                    continue;
                }

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
                seenApprovers.Add(flow.EmployeeId);
                first = false;
            }

            return recruitmentApprovals;
        }
    }
}
