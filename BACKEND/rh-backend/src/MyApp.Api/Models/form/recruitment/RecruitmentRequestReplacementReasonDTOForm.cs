using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.form.recruitment
{
    public class RecruitmentRequestReplacementReasonDTOForm
    {
        [Required]
        [MaxLength(50)]
        public string RecruitmentRequestId { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string ReplacementReasonId { get; set; } = null!;

        [MaxLength(250)]
        public string? Description { get; set; }
    }
}
