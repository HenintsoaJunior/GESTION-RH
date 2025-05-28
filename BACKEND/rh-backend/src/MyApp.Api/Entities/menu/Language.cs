using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.menu
{
    [Table("language")]
    public class Language
    {
        [Key]
        [Column("language_id")]
        [MaxLength(10)]
        public string LanguageId { get; set; } = null!;

        [Required]
        [Column("language_name")]
        [MaxLength(100)]
        public string LanguageName { get; set; } = null!;

        [Required]
        [Column("abr")]
        [MaxLength(50)]
        public string Abr { get; set; } = null!;

        [Column("is_active")]
        public bool IsActive { get; set; } = true;
    }
}
