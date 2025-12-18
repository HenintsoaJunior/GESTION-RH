using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("skills")]
public class Skill
{
    [Key]
    [Column("skill_id")]
    public string Id { get; set; } = null!;

    [ForeignKey("job_description_id")]
    public JobDescription JobDescription { get; set; } = null!;

    [Column("label")]
    public string Label { get; set; } = null!;
}
