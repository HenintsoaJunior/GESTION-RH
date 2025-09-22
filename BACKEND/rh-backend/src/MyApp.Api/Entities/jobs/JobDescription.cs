using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.jobs;

namespace MyApp.Api.Entities.jobs
{
    [Table("job_descriptions")]
    public class JobDescription : BaseEntity
    {
        [Key]
        [Column("description_id")]
        [MaxLength(50)]
        public string DescriptionId { get; set; } = null!;

        [Required]
        [Column("title")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("attributions")]
        public string? Attributions { get; set; }

        [Column("required_education")]
        [MaxLength(200)]
        public string? RequiredEducation { get; set; }

        [Column("required_experience")]
        public string? RequiredExperience { get; set; }

        [Column("required_personal_qualities")]
        public string? RequiredPersonalQualities { get; set; }

        [Column("required_skills")]
        public string? RequiredSkills { get; set; }

        [Column("required_languages")]
        public string? RequiredLanguages { get; set; }

        public JobDescription() { }

        public JobDescription(JobDescriptionDTO jobDescriptionDTOForm)
        {
            Title = jobDescriptionDTOForm.Title;
            Description = jobDescriptionDTOForm.Description;
            Attributions = jobDescriptionDTOForm.Attributions;
            RequiredEducation = jobDescriptionDTOForm.RequiredEducation;
            RequiredExperience = jobDescriptionDTOForm.RequiredExperience;
            RequiredPersonalQualities = jobDescriptionDTOForm.RequiredPersonalQualities;
            RequiredSkills = jobDescriptionDTOForm.RequiredSkills;
            RequiredLanguages = jobDescriptionDTOForm.RequiredLanguages;
        }
    }
}
