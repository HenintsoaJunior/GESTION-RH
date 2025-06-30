using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.departments;

namespace MyApp.Api.Entities.users
{
    [Table("users")]
    public class User : BaseEntity
    {
        [Key]
        [Column("user_id")]
        [MaxLength(50)]
        public string UserId { get; set; } = null!;

        [Required]
        [Column("first_name")]
        [MaxLength(255)]
        public string FirstName { get; set; } = null!;

        [Required]
        [Column("last_name")]
        [MaxLength(255)]
        public string LastName { get; set; } = null!;

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

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Required]
        [Column("department_id")]
        [MaxLength(50)]
        public string DepartmentId { get; set; } = null!;

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }
    }
}