using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.employee;

namespace MyApp.Api.Entities.employee
{
    [Table("nationalities")]
    public class Nationality
    {
        [Key]
        [Column("nationality_id")]
        [MaxLength(50)]
        public string NationalityId { get; set; } = null!;

        [Required]
        [Column("code")]
        [MaxLength(50)]
        public string Code { get; set; } = null!;

        [Required]
        [Column("name")]
        [MaxLength(100)]
        public string Name { get; set; } = null!;

        public Nationality()
        {
        }

        public Nationality(CreateNationalityDTO dto)
        {
            Code = dto.Code ?? throw new ArgumentNullException(nameof(dto.Code));
            Name = dto.Name ?? throw new ArgumentNullException(nameof(dto.Name));
        }
    }
}