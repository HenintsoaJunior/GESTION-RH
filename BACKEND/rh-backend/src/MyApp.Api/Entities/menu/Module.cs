using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.menu
{
    [Table("module")]
    public class Module : BaseEntity
    {
        [Key]
        [Column("module_id")]
        [MaxLength(50)]
        public string ModuleId { get; set; } = null!;

        [Required]
        [Column("module_name")]
        [MaxLength(100)]
        public string ModuleName { get; set; } = null!;

        [Column("description")]
        public string? Description { get; set; }
    }
}
