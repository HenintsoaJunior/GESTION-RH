using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("jobs_suitabilities")]
public class JobDescriptionSuitability
{
    [Key]
    [Column("job_suitability_id")]
    public string Id { get; set; } = null!;

    [ForeignKey("soft_skill_id")]
    public PersonnalSuitability PersonnalSuitability { get; set; } = null!;

    [ForeignKey("job_description_id")]
    public JobDescription JobDescription { get; set; } = null!;
}
