namespace MyApp.Api.Models.list.menu
{
    public class MenuDto
    {
        public string MenuId { get; set; } = null!;
        public string MenuKey { get; set; } = null!;
        public string? Icon { get; set; }
        public string? Link { get; set; }
        public bool IsEnabled { get; set; }
        public int? Position { get; set; }
        public string? ModuleId { get; set; }
        public List<string> RoleNames { get; set; } = new List<string>();
    }

    public class MenuHierarchyDto
    {
        public string HierarchyId { get; set; } = default!;
        public string? ParentMenuId { get; set; }
        public string MenuId { get; set; } = default!;
        public MenuDto Menu { get; set; } = default!;
        public List<MenuHierarchyDto> Children { get; set; } = new();
    }

    public class ModuleDto
    {
        public string ModuleId { get; set; } = default!;
        public string ModuleName { get; set; } = default!;
        public string? Description { get; set; }
        public List<MenuHierarchyDto> Menus { get; set; } = new();
    }
}