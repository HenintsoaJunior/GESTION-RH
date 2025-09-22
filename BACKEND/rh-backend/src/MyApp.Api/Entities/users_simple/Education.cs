using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.profile;

namespace MyApp.Api.Entities.users_simple
{
    [Table("educations")]
    public class Education : BaseEntity
    {
        [Key]
        [Column("education_id")]
        [MaxLength(250)]
        public string EducationId { get; set; } = null!;

        [Required]
        [Column("utilisateur_id")]
        [MaxLength(250)]
        public string UtilisateurId { get; set; } = null!;

        [Required]
        [Column("etablissement")]
        [MaxLength(250)]
        public string Etablissement { get; set; } = null!;

        [Required]
        [Column("diplome")]
        [MaxLength(250)]
        public string Diplome { get; set; } = null!;

        [Required]
        [Column("annee")]
        [MaxLength(50)]
        public string Annee { get; set; } = null!;

        [ForeignKey("UtilisateurId")]
        public UserSimple? User { get; set; }

        public Education()
        {
        }

        public Education(EducationDto education)
        {
            UtilisateurId = education.UtilisateurId;
            Etablissement = education.Etablissement;
            Diplome = education.Diplome;
            Annee = education.Annee;
        }
    }
}