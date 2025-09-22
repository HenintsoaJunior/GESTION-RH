using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.profile;

namespace MyApp.Api.Entities.users_simple
{
    [Table("languages")]
    public class Language : BaseEntity
    {
        [Key]
        [Column("language_id")]
        [MaxLength(250)]
        public string LanguageId { get; set; } = null!;

        [Required]
        [Column("utilisateur_id")]
        [MaxLength(250)]
        public string UtilisateurId { get; set; } = null!;

        [Required]
        [Column("langue")]
        [MaxLength(150)]
        public string Langue { get; set; } = null!;

        [Required]
        [Column("niveau")]
        [MaxLength(50)]
        public string Niveau { get; set; } = null!;

        [ForeignKey("UtilisateurId")]
        public UserSimple? User { get; set; }

        public Language()
        {
        }

        public Language(LanguageDto language)
        {
            UtilisateurId = language.UtilisateurId;
            Langue = language.Langue;
            Niveau = language.Niveau;
        }
    }
}