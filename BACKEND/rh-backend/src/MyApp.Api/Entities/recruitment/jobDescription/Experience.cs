using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("experiences")]
public class Experience : BaseEntity
{
    [Key]
    [Column("experience_id")]
    public string Id { get; set; } = null!;

    [Column("experience_years")]
    public short ExperienceYears { get; set; }

    [Column("experience_post")]
    public string ExperiencePost { get; set; } = null!;

    [ForeignKey("job_description_id")]
    public JobDescription JobDescription { get; set; } = null!;
}
