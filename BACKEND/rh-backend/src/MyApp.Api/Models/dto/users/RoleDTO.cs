using System.ComponentModel.DataAnnotations;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Models.dto.users;

public class RoleWithGroupedHabilitationsDto
{
    public string? RoleId { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public ICollection<UserRole>? UserRoles { get; set; }
    public List<HabilitationGroupDto>? HabilitationGroups { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class HabilitationGroupDto
{
    public string? GroupId { get; set; }
    public string? Label { get; set; }
    public List<HabilitationDto>? Habilitations { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class HabilitationDto
{
    public string? HabilitationId { get; set; }
    public string? Label { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class RoleIdsRequest
{
    public IEnumerable<string> RoleIds { get; set; } = Enumerable.Empty<string>();
}


public class CreateRoleWithHabilitationsDto
{
    public string UserIdLog { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public IEnumerable<string> HabilitationIds { get; set; } = Enumerable.Empty<string>();
}


public class RoleUpdateDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    public string? UserId { get; set; }
}

public class RoleDeleteDto
{
    [Required]
    public string UserId { get; set; } = string.Empty;
}