using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.menu
{
    [Table("menu_hierarchy")]
    public class MenuHierarchy : BaseEntity
    {
        [Key]
        [Column("hierarchy_id")]
        [MaxLength(50)]
        public string HierarchyId { get; set; } = null!;

        [Column("parent_menu_id")]
        [MaxLength(50)]
        public string? ParentMenuId { get; set; }

        [Required]
        [Column("menu_id")]
        [MaxLength(50)]
        public string MenuId { get; set; } = null!;
    }
}
