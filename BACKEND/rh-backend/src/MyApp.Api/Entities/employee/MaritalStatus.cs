using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.employee
{
    [Table("marital_statuses")]
    public class MaritalStatus
    {
        [Key]
        [Column("marital_status_id")]
        [MaxLength(50)]
        public string MaritalStatusId { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("code")]
        [MaxLength(50)]
        public string Code { get; set; } = null!;

        [Required]
        [Column("label")]
        [MaxLength(50)]
        public string Label { get; set; } = null!;
    }
}
// This class represents the marital status of an employee.