
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.menu
{
    [Table("menu_role")]
    [PrimaryKey(nameof(MenuId), nameof(RoleId))]
    public class MenuRole : BaseEntity
    {
        [Column("menu_id")]
        [MaxLength(50)]
        public string MenuId { get; set; } = null!;
        
        [Column("role_id")]
        [MaxLength(50)]
        public string RoleId { get; set; } = null!;

        [ForeignKey("MenuId")]
        public Menu Menu { get; set; } = null!;

        [ForeignKey("RoleId")]
        public Role Role { get; set; } = null!;
    }
}