using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("level_educations")]
public class LevelEducation
{
    [Key]
    [Column("level_education_id")]
    public string Id { get; set; } = null!;

    [Column("level_education_name")]
    public string Name { get; set; } = null!;
}
