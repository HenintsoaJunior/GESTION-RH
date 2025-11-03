using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.zones;
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

        [Column("ville")]
        [MaxLength(255)]
        public string? Ville { get; set; }

        [Column("code_postal")]
        [MaxLength(20)]
        public string? CodePostal { get; set; }

        [Required]
        [Column("pays")]
        [MaxLength(255)]
        public string Pays { get; set; } = string.Empty;

        [Column("zone_id")]
        [MaxLength(50)]
        public string? ZoneId { get; set; }

        [ForeignKey("ZoneId")]
        public GeoZone? GeoZone { get; set; }

        public Lieu()
        {
        }

        public Lieu(LieuDTOForm dto)
        {
            Nom = dto.Nom ?? throw new ArgumentNullException(nameof(dto.Nom));
            Ville = dto.Ville;
            CodePostal = dto.CodePostal;
            Pays = dto.Pays ?? throw new ArgumentNullException(nameof(dto.Pays));
            ZoneId = dto.ZoneId;
        }
    }
}