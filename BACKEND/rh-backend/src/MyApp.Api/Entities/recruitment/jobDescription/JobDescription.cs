using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("job_descriptions")]
public class JobDescription : BaseEntity
{
    [Key]
    [Column("job_description_id")]
    public string Id { get; set; } = null!;

    [Column("mission")]
    public string Mission { get; set; } = null!;

    [Column("request_id")]
    public string RequestId { get; set; } = null!;

    [ForeignKey(nameof(RequestId))]
    public RecruitmentRequest Request { get; set; } = null!;

// Collections
    public List<Attribution> Attributions { get; set; } = [];
    public List<Experience> Experiences { get; set; } = [];
    public List<Formation> Formations { get; set; } = [];
    public List<JobDescriptionSoftSkill> SoftSkills { get; set; } = [];
    public List<Skill> Skills { get; set; } = [];
    public List<JobDescriptionValidation> Validations { get; set; } = [];
}
