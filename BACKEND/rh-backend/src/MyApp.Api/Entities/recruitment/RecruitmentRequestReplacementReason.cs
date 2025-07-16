using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment
{
    [Table("recruitment_request_replacement_reasons")]
    public class RecruitmentRequestReplacementReason
    {
        [Key, Column(Order = 0)]
        [MaxLength(50)]
        public string RecruitmentRequestId { get; set; } = null!;

        [Column(Order = 1)]
        [MaxLength(50)]
        public string ReplacementReasonId { get; set; } = null!;

        public string? Description { get; set; }

        // Navigation
        [ForeignKey("RecruitmentRequestId")]
        public RecruitmentRequest? RecruitmentRequest { get; set; }

        [ForeignKey("ReplacementReasonId")]
        public ReplacementReason? ReplacementReason { get; set; }
    }
}
