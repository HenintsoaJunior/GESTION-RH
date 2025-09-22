using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.profile;
namespace MyApp.Api.Entities.users_simple
{
    [Table("experiences")]
    public class Experience : BaseEntity
    {
        [Key]
        [Column("experience_id")]
        [MaxLength(250)]
        public string ExperienceId { get; set; } = null!;

        [Required]
        [Column("utilisateur_id")]
        [MaxLength(250)]
        public string UtilisateurId { get; set; } = null!;

        [Required]
        [Column("entreprise")]
        [MaxLength(250)]
        public string Entreprise { get; set; } = null!;

        [Required]
        [Column("poste")]
        [MaxLength(250)]
        public string Poste { get; set; } = null!;

        [Required]
        [Column("duree")]
        [MaxLength(100)]
        public string Duree { get; set; } = null!;

        [Column("description")]
        public string? Description { get; set; }

        [ForeignKey("UtilisateurId")]
        public UserSimple? User { get; set; }

        public Experience()
        {
        }

        public Experience(ExperienceDto experience)
        {
            UtilisateurId = experience.UtilisateurId;
            Entreprise = experience.Entreprise;
            Poste = experience.Poste;
            Duree = experience.Duree;
            Description = experience.Description;
        }
    }
}