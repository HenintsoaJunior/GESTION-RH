using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.lieu;

namespace MyApp.Api.Entities.mission
{
    [Table("lieu")]
    public class Lieu : BaseEntity
    {
        [Key]
        [Column("lieu_id")]
        [MaxLength(50)]
        public string LieuId { get; set; } = null!;

        [Required]
        [Column("nom")]
        [MaxLength(255)]
        public string Nom { get; set; } = string.Empty;

        [Column("adresse")]
        [MaxLength(500)]
        public string? Adresse { get; set; }

        [Column("ville")]
        [MaxLength(255)]
        public string? Ville { get; set; }

        [Column("code_postal")]
        [MaxLength(20)]
        public string? CodePostal { get; set; }

        [Column("pays")]
        [MaxLength(255)]
        public string? Pays { get; set; }

        public Lieu()
        {
        }

        public Lieu(LieuDTOForm lieuDTO)
        {
            Nom = lieuDTO.Nom;
            Adresse = lieuDTO.Adresse;
            Ville = lieuDTO.Ville;
            CodePostal = lieuDTO.CodePostal;
            Pays = lieuDTO.Pays;
        }
    }
}