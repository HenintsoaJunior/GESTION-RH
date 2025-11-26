using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("replacement_reasons")]
public class ReplacementReason
{
    [Key]
    [Column("replacement_reason_id")]
    public string Id {get; set;} = null!;

    [Column("reason_name")]
    public string Reason {get; set;} = null!;
}
