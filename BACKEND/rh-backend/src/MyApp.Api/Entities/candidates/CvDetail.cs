using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.application;
using MyApp.Api.Models.form.candidates;

namespace MyApp.Api.Entities.candidates
{
    [Table("cv_details")]
    public class CvDetail : BaseEntity
    {
        [Key]
        [Column("cv_detail_id")]
        [MaxLength(50)]
        public string CvDetailId { get; set; } = null!;

        [Column("extracted_skills")]
        public string? ExtractedSkills { get; set; }

        [Column("extracted_experience")]
        public string? ExtractedExperience { get; set; }

        [Column("extracted_education")]
        public string? ExtractedEducation { get; set; }

        [Column("extracted_languages")]
        public string? ExtractedLanguages { get; set; }

        [Required]
        [Column("application_id")]
        [MaxLength(50)]
        public string ApplicationId { get; set; } = null!;

        [ForeignKey("ApplicationId")]
        public Application? Application { get; set; }

        public CvDetail() { }

        public CvDetail(CvDetailDTOForm dto)
        {
            ExtractedSkills = dto.ExtractedSkills;
            ExtractedExperience = dto.ExtractedExperience;
            ExtractedEducation = dto.ExtractedEducation;
            ExtractedLanguages = dto.ExtractedLanguages;
            ApplicationId = dto.ApplicationId;
        }
    }
}