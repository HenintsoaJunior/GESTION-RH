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


    [Column("user_id")]
    public string ValidatorId { get; set; } = null!;

    [ForeignKey(nameof(ValidatorId))]
    public User Validator { get; set; } = null!;


    [Column("status_id")]
    public string StatusId { get; set; } = null!;

    [ForeignKey(nameof(StatusId))]
    public JobDescriptionStatus Status { get; set; } = null!;


    [Column("job_description_id")]
    public string JobDescriptionId { get; set; } = null!;

    [ForeignKey(nameof(JobDescriptionId))]
    public JobDescription JobDescription { get; set; } = null!;
}
