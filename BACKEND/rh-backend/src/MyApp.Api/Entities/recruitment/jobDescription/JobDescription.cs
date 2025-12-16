using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("job_descriptions")]
public class JobDescription : BaseEntity
{
    [Key]
    [Column("job_description_id")]
    public string Id { get; set; } = null!;

    [Column("mission")]
    public string Mission { get; set; } = null!;

    [ForeignKey("request_id")]
    public RecruitmentRequest Request { get; set; } = null!;
}
