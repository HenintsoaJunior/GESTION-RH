using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("job_soft_skills")]
public class JobDescriptionSoftSkill
{
    [Key]
    [Column("job_soft_skill_id")]
    public string Id { get; set; } = null!;

    [Column("soft_skill_id")]
    public string SoftSkillId { get; set; } = null!;

    [ForeignKey(nameof(SoftSkillId))]
    public SoftSkill SoftSkill { get; set; } = null!;


    [Column("job_description_id")]
    public string JobDescriptionId { get; set; } = null!;

    [ForeignKey(nameof(JobDescriptionId))]
    public JobDescription JobDescription { get; set; } = null!;
}
