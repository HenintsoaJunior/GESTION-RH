using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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
    }
}
