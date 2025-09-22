using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.profile;
namespace MyApp.Api.Entities.users_simple
{
    [Table("skills")]
    public class Skill : BaseEntity
    {
        [Key]
        [Column("skill_id")]
        [MaxLength(250)]
        public string SkillId { get; set; } = null!;

        [Required]
        [Column("utilisateur_id")]
        [MaxLength(250)]
        public string UtilisateurId { get; set; } = null!;

        [Required]
        [Column("competence")]
        [MaxLength(250)]
        public string Competence { get; set; } = null!;

        [ForeignKey("UtilisateurId")]
        public UserSimple? User { get; set; }

        public Skill()
        {
        }

        public Skill(SkillDto skill)
        {
            UtilisateurId = skill.UtilisateurId;
            Competence = skill.Competence;
        }
    }
}