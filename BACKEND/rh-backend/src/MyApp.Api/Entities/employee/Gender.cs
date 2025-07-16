using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.employee
{
    [Table("genders")]
    public class Gender : CodeLabel
    {
        [Key]
        [Column("gender_id")]
        [MaxLength(50)]
        public string GenderId { get; set; } = null!;
    }
}
