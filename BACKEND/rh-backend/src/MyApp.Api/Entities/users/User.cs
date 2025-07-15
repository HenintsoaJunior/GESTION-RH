using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Entities.users
{
    [Table("users")]
    public class User : BaseEntity
    {
        [Key]
        [Column("user_id")]
        [MaxLength(50)]
        public string UserId { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("email")]
        [MaxLength(100)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("password")]
        [MaxLength(255)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Column("role")]
        [MaxLength(50)]
        public string Role { get; set; } = string.Empty;

        [Required]
        [Column("function_")]
        [MaxLength(100)]
        public string Function { get; set; } = string.Empty;

        [Required]
        [Column("employee_id")]
        [MaxLength(50)]
        public string EmployeeId { get; set; } = null!;

        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }
    }
}
