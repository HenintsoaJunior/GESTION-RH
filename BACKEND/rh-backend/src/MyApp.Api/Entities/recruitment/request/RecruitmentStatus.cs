using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

public abstract class RecruitmentStatus
{
    [Key]
    [Column("status_id")]
    public string Id {get; set;} = null!;

    [Column("status_name")]
    public string Name {get; set;} = null!;
}
