using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models.dto.users;

namespace MyApp.Api.Entities.users
{
    [Table("user_role")]
    [PrimaryKey(nameof(UserId), nameof(RoleId))]
    public class UserRole : BaseEntity
    {
        [Column("user_id")]
        [MaxLength(50)]
        public string UserId { get; set; } = null!;
        
        [Column("role_id")]
        [MaxLength(50)]
        public string RoleId { get; set; } = null!;

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [ForeignKey("RoleId")]
        public Role? Role { get; set; }
        
        public UserRole(){}

        public UserRole(UserRoleDTOForm dto)
        {
            UserId = dto.UserId;
            RoleId = dto.RoleId;
        }
    }
}