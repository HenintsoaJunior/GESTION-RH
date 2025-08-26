using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.users;

namespace MyApp.Api.Entities.users;

[Table("habilitations")]
public class Habilitation : BaseEntity
{
    [Key]
    [Column("habilitation_id")]
    [MaxLength(50)]
    public string HabilitationId { get; set; } = null!;

    [Required]
    [Column("label")]
    [MaxLength(50)]
    public string Label { get; set; } = null!;

    public ICollection<RoleHabilitation> RoleHabilitations { get; set; } = new List<RoleHabilitation>();
    
    public Habilitation(){}

    public Habilitation(HabilitationDTOForm dto)
    {
        Label = dto.Label;
    }
}