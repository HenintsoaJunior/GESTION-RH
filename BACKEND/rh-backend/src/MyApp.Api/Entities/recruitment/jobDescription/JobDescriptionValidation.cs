using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.recruitment;

[Table("job_validations")]
public class JobDescriptionValidation : BaseEntity
{
    [Key]
    [Column("job_validation_id")]
    public string Id { get; set; } = null!;

    [ForeignKey("user_id")]
    public User User { get; set; } = null!;

    [ForeignKey("status_id")]
    public JobDescriptionStatus Status { get; set; } = null!;


    [Column("job_description_id")]
    public string JobDescriptionId { get; set; } = null!;

    [ForeignKey(nameof(JobDescriptionId))]
    public JobDescription JobDescription { get; set; } = null!;
}
