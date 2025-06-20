using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.menu
{
    [Table("menu_translation")]
    public class MenuTranslation
    {
        [Key]
        [Column("translation_id")]
        [MaxLength(50)]
        public string TranslationId { get; set; } = null!;

        [Required]
        [Column("label")]
        [MaxLength(100)]
        public string Label { get; set; } = null!;

        [Required]
        [Column("language_id")]
        [MaxLength(10)]
        public string LanguageId { get; set; } = null!;

        [Required]
        [Column("menu_id")]
        [MaxLength(50)]
        public string MenuId { get; set; } = null!;
    }
}
