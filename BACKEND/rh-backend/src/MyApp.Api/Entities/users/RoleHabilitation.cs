using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models.dto.users;

namespace MyApp.Api.Entities.users;

[Table("role_habilitation")]
[PrimaryKey(nameof(HabilitationId), nameof(RoleId))]
public class RoleHabilitation
{
    [Column("habilitation_id")]
    [MaxLength(50)]
    public string HabilitationId { get; set; } = null!;
    
    [Column("role_id")]
    [MaxLength(50)]
    public string RoleId { get; set; } = null!;

    [ForeignKey("HabilitationId")]
    public Habilitation? Habilitation { get; set; }

    [ForeignKey("RoleId")]
    public Role? Role { get; set; }
    
    public RoleHabilitation(){}

    public RoleHabilitation(RoleHabilitationDTOForm dto)
    {
        HabilitationId = dto.HabilitationId;
        RoleId = dto.RoleId;    
    }
}