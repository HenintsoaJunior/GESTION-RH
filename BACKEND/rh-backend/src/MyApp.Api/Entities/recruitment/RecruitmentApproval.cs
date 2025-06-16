using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.departments;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_approval")]
    public class RecruitmentApproval
    {

        [Column("approver_id")]
        [MaxLength(50)]
        public string ApproverId { get; set; } = null!;
        [ForeignKey("ApproverId")]
        public Department? Approver { get; set; } = null!;

        [Column("recruitment_request_id")]
        [MaxLength(50)]
        public string RecruitmentRequestId { get; set; } = null!;
        [ForeignKey("RecruitmentRequestId")]
        public RecruitmentRequest? RecruitmentRequest { get; set; } = null!;

        [Column("status")]
        [MaxLength(50)]
        public string? Status { get; set; } = "En Attente";

        [Column("approval_order")]
        public int? ApprovalOrder { get; set; }

        [Column("approval_date")]
        public DateTime? ApprovalDate { get; set; }

        [Column("comments")]
        public string? Comments { get; set; }

        [Column("signature")]
        public byte[] Signature { get; set; } = null!;

    }
}
