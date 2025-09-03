using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.users;

public class RoleDTOForm
{
    [Required(ErrorMessage = "Le nom du rôle est obligatoire.")]
    public string? Name { get; set; }
    public string? Description { get; set; }
    [Required(ErrorMessage = "Le user est obligatoire.")]
    public string? UserId { get; set; }
    public List<string> HabilitationIds { get; set; } = new List<string>();
}