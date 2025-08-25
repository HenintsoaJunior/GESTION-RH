using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.recruitment
{
    public class RecruitmentRequestReplacementReasonDTOForm
    {
        [Required]
        [MaxLength(50)]
        public string ReplacementReasonId { get; set; } = null!;

        [MaxLength(250)]
        public string? Description { get; set; }
    }
}
