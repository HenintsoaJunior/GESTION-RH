using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("job_experiences")]
public class Experience
{
    [Key]
    [Column("job_experience_id")]
    public string Id { get; set; } = null!;

    [Column("job_experience_years")]
    public short ExperienceYears { get; set; }

    [Column("job_experience_post")]
    public string ExperiencePost { get; set; } = null!;

    [ForeignKey("job_description_id")]
    public JobDescription JobDescription { get; set; } = null!;
}
