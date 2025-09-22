using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.profile;

namespace MyApp.Api.Entities.users_simple
{
    [Table("personal_qualities")]
    public class PersonalQuality : BaseEntity
    {
        [Key]
        [Column("quality_id")]
        [MaxLength(250)]
        public string QualityId { get; set; } = null!;

        [Required]
        [Column("utilisateur_id")]
        [MaxLength(250)]
        public string UtilisateurId { get; set; } = null!;

        [Required]
        [Column("qualite")]
        [MaxLength(250)]
        public string Qualite { get; set; } = null!;

        [ForeignKey("UtilisateurId")]
        public UserSimple? User { get; set; }

        public PersonalQuality()
        {
        }

        public PersonalQuality(PersonalQualityDto quality)
        {
            UtilisateurId = quality.UtilisateurId;
            Qualite = quality.Qualite;
        }
    }
}