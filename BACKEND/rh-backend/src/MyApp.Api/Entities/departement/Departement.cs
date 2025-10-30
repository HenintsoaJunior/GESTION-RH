
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.dto.departement;

namespace MyApp.Api.Entities.departement
{
    [Table("departement")]
    public class Departement : BaseEntity
    {
        [Key]
        [Column("departement_id")]
        [MaxLength(50)]
        public string DepartementId { get; set; } = null!;

        [Column("departement_name")]
        [MaxLength(100)]
        [Required]
        public string DepartementName { get; set; } = string.Empty;

        [Column("direction_id")]
        [MaxLength(50)]
        [Required]
        public string DirectionId { get; set; } = null!;

        [ForeignKey("DirectionId")]
        public virtual Direction Direction { get; set; } = null!;

        public Departement()
        {
        }

        public Departement(DepartementDTOForm dto)
        {
            DepartementName = dto.DepartementName ?? throw new ArgumentNullException(nameof(dto.DepartementName));
            DirectionId = dto.DirectionId ?? throw new ArgumentNullException(nameof(dto.DirectionId));
        }
    }
}
