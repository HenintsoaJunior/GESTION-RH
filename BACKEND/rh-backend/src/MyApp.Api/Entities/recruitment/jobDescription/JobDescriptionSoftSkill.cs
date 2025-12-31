using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("job_soft_skills")]
public class JobDescriptionSoftSkill
{
    [Key]
    [Column("job_soft_skill_id")]
    public string Id { get; set; } = null!;

    [ForeignKey("soft_skill_id")]
    public SoftSkill SoftSkill { get; set; } = null!;

    [ForeignKey("job_description_id")]
    public JobDescription JobDescription { get; set; } = null!;
}
