using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.jobs
{
    public class JobDescriptionDTO
    {
        [MaxLength(50)]
        public string DescriptionId { get; set; } = null!;

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        public string? Attributions { get; set; }

        [MaxLength(200)]
        public string? RequiredEducation { get; set; }

        public string? RequiredExperience { get; set; }
        public string? RequiredPersonalQualities { get; set; }

        public string? RequiredSkills { get; set; }
        public string? RequiredLanguages { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

    }
    public class JobDescriptionDTOForm : JobDescriptionDTO
    {
        [Required]
        [MaxLength(50)]
        public string OrganigramId { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string HierarchicalAttachmentId { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string SiteId { get; set; } = null!;
    }
}
