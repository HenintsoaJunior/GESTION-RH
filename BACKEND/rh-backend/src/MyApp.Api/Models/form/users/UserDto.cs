using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.form.users;

public class UserDto
{
    [Required]
    [MaxLength(50)]
    public string UserId { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    public string? Name { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    [EmailAddress]
    public string Email { get; set; } = default!;

    [MaxLength(100)]
    public string? Department { get; set; }

    [MaxLength(100)]
    public string? Position { get; set; }

    [MaxLength(50)]
    public string? SuperiorId { get; set; }

    [MaxLength(255)]
    public string? SuperiorName { get; set; }
}