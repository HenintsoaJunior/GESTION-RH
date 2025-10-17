using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.users;

namespace MyApp.Api.Entities.users;

[Table("habilitation_groups")]
public class HabilitationGroup : BaseEntity
{
    [Key]
    [Column("group_id")]
    [MaxLength(50)]
    public string GroupId { get; set; } = null!;

    [Required]
    [Column("label")]
    [MaxLength(100)]
    public string Label { get; set; } = null!;

    public ICollection<Habilitation> Habilitations { get; set; } = new List<Habilitation>();
    
    public HabilitationGroup() { }

    public HabilitationGroup(HabilitationGroupDTOForm dto)
    {
        Label = dto.Label;
    }
}