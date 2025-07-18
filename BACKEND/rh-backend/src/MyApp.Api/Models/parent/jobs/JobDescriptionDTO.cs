using System.ComponentModel.DataAnnotations;

namespace MyApp.Models.parent.Jobs
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
}
