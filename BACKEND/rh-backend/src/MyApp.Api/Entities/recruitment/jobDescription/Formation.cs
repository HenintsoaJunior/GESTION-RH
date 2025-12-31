using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("job_formations")]
public class Formation
{
    [Key]
    [Column("job_formation_id")]
    public string Id { get; set; } = null!;

    [ForeignKey("education_id")]
    public Education Education { get; set; } = null!;

    [ForeignKey("job_description_id")]
    public JobDescription JobDescription { get; set; } = null!;

    [ForeignKey("level_education_id")]
    public LevelEducation LevelEducation { get; set; } = null!;
}
