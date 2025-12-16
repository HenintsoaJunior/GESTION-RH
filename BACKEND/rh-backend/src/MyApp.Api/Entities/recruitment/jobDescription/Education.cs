using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("educations")]
public class Education
{
    [Key]
    [Column("education_id")]
    public string Id { get; set; } = null!;

    [Column("education_name")]
    public string Name { get; set; } = null!;

    [Column("is_deleted")]
    public bool IsDeleted { get; set; } = false;
}
