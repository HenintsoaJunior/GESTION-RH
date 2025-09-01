using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.users;

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

    [MaxLength(50)]
    public string? Matricule { get; set; }
    
    [MaxLength(50)]
    public string? Department { get; set; }

    [MaxLength(100)]
    public string? Position { get; set; }

    [MaxLength(50)]
    public string? SuperiorId { get; set; }

    [MaxLength(255)]
    public string? SuperiorName { get; set; }
}


public class UserRoleDtoFormBulk
{
    public required string UserId { get; set; }
    public required IEnumerable<string> RoleIds { get; set; }
}
