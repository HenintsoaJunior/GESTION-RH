using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.form.recruitment
{
    public class RecruitmentApprovalDTOform
    {
        [Required]
        public string RecruitmentRequestId { get; set; } = null!;

        [Required]
        public string ApproverId { get; set; } = null!;

        [Required]
        public string ApprovalFlowId { get; set; } = null!;

        public string? Status { get; set; }

        public int ApprovalOrder { get; set; }

        public DateTime? ApprovalDate { get; set; }

        public string? Comment { get; set; }

        public byte[]? Signature { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}
