using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("job_formations")]
public class Formation
{
    [Key]
    [Column("job_formation_id")]
    public string Id { get; set; } = null!;

    [Column("education_id")]
    public string EducationId { get; set; } = null!;

    [ForeignKey(nameof(EducationId))]
    public Education Education { get; set; } = null!;


    [Column("job_description_id")]
    public string JobDescriptionId { get; set; } = null!;

    [ForeignKey(nameof(JobDescriptionId))]
    public JobDescription JobDescription { get; set; } = null!;


    [Column("level_education_id")]
    public string LevelEducationId { get; set; } = null!;

    [ForeignKey(nameof(LevelEducationId))]
    public LevelEducation LevelEducation { get; set; } = null!;
}
