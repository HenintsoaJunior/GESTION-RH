using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace MyApp.Api.Models.recruitment
{
    public class CreateRecruitmentRequestDto
    {
        [MaxLength(50)] 
        public string? RecruitmentRequestId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string? JobTitle { get; set; }

        public string? Description { get; set; }

        [MaxLength(20)]
        public string? Status { get; set; }

        [Required]
        [MaxLength(50)]
        public string? RequesterId { get; set; }

        public DateTime RequestDate { get; set; } = DateTime.UtcNow;

        public DateTime? ApprovalDate { get; set; }

        public IFormFileCollection? Files { get; set; }

    }
}