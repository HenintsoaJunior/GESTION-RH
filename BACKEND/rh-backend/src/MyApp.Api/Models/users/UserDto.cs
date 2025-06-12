using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.users
{
    public class UserDto
    {
        [Required]
        [MaxLength(50)]
        public string UserId { get; set; } = default!;

        [MaxLength(255)]
        public string? Name { get; set; }

        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; } = default!;

        [Required]
        [MaxLength(255)]
        public string Password { get; set; } = default!;

        [Required]
        [MaxLength(50)]
        public string Role { get; set; } = default!;

        [Required]
        [MaxLength(50)]
        public string DepartmentId { get; set; } = default!;
    }
}