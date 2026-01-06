using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("job_attributions")]
public class Attribution
{
    [Key]
    [Column("job_attribution_id")]
    public string Id { get; set; } = null!;

    [Column("job_attribution")]
    public string Label { get; set; } = null!;

    [Column("job_description_id")]
    public string JobDescriptionId { get; set; } = null!;

    [ForeignKey(nameof(JobDescriptionId))]
    public JobDescription JobDescription { get; set; } = null!;
}
