namespace MyApp.Api.Models.menu
{
    public class ModuleDto
    {
        public string ModuleId { get; set; } = default!;
        public string ModuleName { get; set; } = default!;
        public string? Description { get; set; }
    }
}
