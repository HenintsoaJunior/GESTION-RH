using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("attributions")]
public class Attribution
{
    [Key]
    [Column("attribution_id")]
    public string Id { get; set; } = null!;

    [Column("attribution")]
    public string Label { get; set; } = null!;

    [ForeignKey("job_description_id")]
    public JobDescription JobDescription { get; set; } = null!;
}
