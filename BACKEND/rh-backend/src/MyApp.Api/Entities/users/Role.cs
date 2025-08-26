using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;
using MyApp.Api.Models.dto.users;

namespace MyApp.Api.Entities.users
{
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
        [MaxLength(250)]
        public string? Description { get; set; }

        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();

        public ICollection<RoleHabilitation> RoleHabilitations { get; set; } = new List<RoleHabilitation>();
        
        public Role(){}

        public Role(RoleDTOForm dto)
        {
            Name = dto.Name;
            Description = dto.Description;
        }
    }
}