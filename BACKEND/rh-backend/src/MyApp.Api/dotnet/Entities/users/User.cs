using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.departments;

namespace MyApp.Api.Entities.users
{
    [Table("users")]
    public class User
    {
        [Key]
        [Column("user_id")]
        [MaxLength(50)]
        public string UserId { get; set; } = null!;

        [Column("name")]
        [MaxLength(255)]
        public string? Name { get; set; }

        [Required]
        [Column("email")]
        [MaxLength(100)]
        public string Email { get; set; } = null!;

        [Required]
        [Column("password")]
        [MaxLength(255)]
        public string Password { get; set; } = null!;

        [Required]
        [Column("role")]
        [MaxLength(50)]
        public string Role { get; set; } = null!;

        [Required]
        [Column("department_id")]
        [MaxLength(50)]
        public string DepartmentId { get; set; } = null!;

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }
    }
}