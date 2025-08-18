using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace MyApp.Api.Entities.menu
{
    [Table("menu")]
    public class Menu : BaseEntity
    {
        [Key]
        [Column("menu_id")]
        [MaxLength(50)]
        public string MenuId { get; set; } = null!;

        [Required]
        [Column("menu_key")]
        [MaxLength(50)]
        public string MenuKey { get; set; } = null!;

        [Column("icon")]
        [MaxLength(50)]
        public string? Icon { get; set; }

        [Column("link")]
        [MaxLength(255)]
        public string? Link { get; set; }

        [Column("is_enabled")]
        public bool IsEnabled { get; set; } = true;

        [Column("position")]
        public int? Position { get; set; }

        [Column("module_id")]
        [MaxLength(50)]
        public string? ModuleId { get; set; }

        public List<MenuRole> MenuRoles { get; set; } = new List<MenuRole>(); // Added navigation property
    }
}