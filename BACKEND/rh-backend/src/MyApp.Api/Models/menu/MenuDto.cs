namespace MyApp.Api.Models.menu
{
    public class MenuDto
    {
        public string MenuId { get; set; } = default!;
        public string MenuKey { get; set; } = default!;
        public string? Icon { get; set; }
        public string? Link { get; set; }
        public bool IsEnabled { get; set; } = true;
        public int? Position { get; set; }
        public string? ModuleId { get; set; }
    }
}
