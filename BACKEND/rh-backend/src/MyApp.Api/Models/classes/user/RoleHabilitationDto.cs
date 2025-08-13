namespace MyApp.Api.Models.classes.user;

public class RoleHabilitationDto
{
    public string RoleName { get; set; } = string.Empty;
    public IEnumerable<string> Habilitations { get; set; } = Enumerable.Empty<string>();
}