using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("soft_skills")]
public class SoftSkill
{
    [Key]
    [Column("soft_skill_id")]
    public string Id { get; set; } = null!;

    [Column("soft_skill_name")]
    public string Name { get; set; } = null!;
}
