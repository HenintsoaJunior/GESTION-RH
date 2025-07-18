using System.ComponentModel.DataAnnotations;
using MyApp.Api.Model.form.employee;
namespace MyApp.Api.Models.form.recruitment
{
    public class RecruitmentRequestDTOForm
    {

        [Required]
        [MaxLength(255)]
        public string PositionTitle { get; set; } = null!;

        public int PositionCount { get; set; } = 1;

        [MaxLength(100)]
        public string? ContractDuration { get; set; }

        [MaxLength(255)]
        public string? FormerEmployeeName { get; set; }

        public DateTime? ReplacementDate { get; set; }

        [MaxLength(250)]
        public string? NewPositionExplanation { get; set; }

        public DateTime? DesiredStartDate { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [MaxLength(10)]
        public string Status { get; set; } = "En attente";

        public byte[]? Files { get; set; } // à gérer en base64 côté frontend

        [Required]
        public string RequesterId { get; set; } = null!;

        [Required]
        public string ContractTypeId { get; set; } = null!;

        [Required]
        public string SiteId { get; set; } = null!;

        [Required]
        public string RecruitmentReasonId { get; set; } = null!;
        public RecruitmentRequestDetailDTOForm RecruitmentRequestDetail { get; set; } = null!;
        public IEnumerable<RecruitmentRequestReplacementReasonDTOForm>? ReplacementReasons { get; set; } = null;
    }
}
