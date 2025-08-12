using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.users;

[Table("role")]
public class Role : BaseEntity
{
    [Key]
    [Column("role_id")]
    [MaxLength(50)]
    public string RoleId { get; set; } = null!;

    [Required]
    [Column("name")]
    [MaxLength(50)]
    public string Name { get; set; } = null!;

    [Column("description")]
    [MaxLength(50)]
    public string? Description { get; set; }
    
    public ICollection<RoleHabilitation> RoleHabilitations { get; set; } = new List<RoleHabilitation>();
}