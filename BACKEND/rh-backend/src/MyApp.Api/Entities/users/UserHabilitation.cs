using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models.dto.users;

namespace MyApp.Api.Entities.users;

[Table("user_habilitations")]
[PrimaryKey(nameof(HabilitationId), nameof(UserId))]
public class UserHabilitation : BaseEntity
{
    [Column("habilitation_id")]
    [MaxLength(50)]
    public string HabilitationId { get; set; } = null!;
    
    [Column("user_id")]
    [MaxLength(250)]
    public string UserId { get; set; } = null!;

    [ForeignKey("HabilitationId")]
    public Habilitation? Habilitation { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }
    
    public UserHabilitation(){}
}