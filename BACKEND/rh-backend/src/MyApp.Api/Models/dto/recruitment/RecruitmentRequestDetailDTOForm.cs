using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.recruitment
{
    public class RecruitmentRequestDetailDTOForm
    {
        [Required]
        [MaxLength(255)]
        public string SupervisorPosition { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string DirectionId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string DepartmentId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string ServiceId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string DirectSupervisorId { get; set; } = string.Empty;
    }
}
