namespace MyApp.Api.Models.menu
{
    public class MenuHierarchyDto
    {
        public string HierarchyId { get; set; } = default!;
        public string? ParentMenuId { get; set; }
        public string MenuId { get; set; } = default!;
    }
}
