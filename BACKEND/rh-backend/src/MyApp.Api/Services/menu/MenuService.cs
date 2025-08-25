using MyApp.Api.Entities.menu;
using MyApp.Api.Repositories.menu;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models.dto.menu;

namespace MyApp.Api.Services.menu
{
    public interface IMenuService
    {
        Task<IEnumerable<MenuHierarchyDto>> GetMenuHierarchyAsync(string[]? roleNames = null);
        Task<IEnumerable<ModuleDto>> GetModulesAsync();
    }

    public class MenuService : IMenuService
    {
        private readonly IMenuRepository _menuRepository;
        private readonly IMenuHierarchyRepository _hierarchyRepository;
        private readonly IModuleRepository _moduleRepository;

        public MenuService(
            IMenuRepository menuRepository,
            IMenuHierarchyRepository hierarchyRepository,
            IModuleRepository moduleRepository)
        {
            _menuRepository = menuRepository;
            _hierarchyRepository = hierarchyRepository;
            _moduleRepository = moduleRepository;
        }

        public async Task<IEnumerable<MenuHierarchyDto>> GetMenuHierarchyAsync(string[]? roleNames = null)
        {
            var rootHierarchies = await _hierarchyRepository.GetRootMenusAsync();
            var result = new List<MenuHierarchyDto>();

            // Fetch all menus with their roles in one query to avoid N+1
            var menusWithRoles = await _menuRepository.GetAllWithRolesAsync(roleNames);
            var menuDict = menusWithRoles.ToDictionary(m => m.MenuId, m => m);

            foreach (var hierarchy in rootHierarchies)
            {
                var dto = await BuildMenuHierarchyDto(hierarchy, menuDict);
                if (dto != null)
                {
                    result.Add(dto);
                }
            }

            return result.OrderBy(r => r.Menu.Position).ToList();
        }

        public async Task<IEnumerable<ModuleDto>> GetModulesAsync()
        {
            var modules = await _moduleRepository.GetAllAsync();
            return modules.Select(MapToModuleDto);
        }

        private async Task<MenuHierarchyDto?> BuildMenuHierarchyDto(MenuHierarchy hierarchy, Dictionary<string, Menu> menuDict)
        {
            if (!menuDict.TryGetValue(hierarchy.MenuId, out var menu) || !menu.IsEnabled)
                return null;

            var menuDto = new MenuDto
            {
                MenuId = menu.MenuId,
                MenuKey = menu.MenuKey,
                Icon = menu.Icon,
                Link = menu.Link,
                IsEnabled = menu.IsEnabled,
                Position = menu.Position,
                ModuleId = menu.ModuleId,
                RoleNames = menu.MenuRoles?.Select(mr => mr.Role.Name).ToList() ?? new List<string>()
            };

            var hierarchyDto = new MenuHierarchyDto
            {
                HierarchyId = hierarchy.HierarchyId,
                ParentMenuId = hierarchy.ParentMenuId,
                MenuId = hierarchy.MenuId,
                Menu = menuDto,
                Children = new List<MenuHierarchyDto>()
            };

            // Récupérer les sous-menus
            var childHierarchies = await _hierarchyRepository.GetByParentIdAsync(hierarchy.MenuId);
            foreach (var childHierarchy in childHierarchies)
            {
                var childDto = await BuildMenuHierarchyDto(childHierarchy, menuDict);
                if (childDto != null)
                {
                    hierarchyDto.Children.Add(childDto);
                }
            }

            hierarchyDto.Children = hierarchyDto.Children.OrderBy(c => c.Menu.Position).ToList();
            return hierarchyDto;
        }

        private ModuleDto MapToModuleDto(Module module)
        {
            return new ModuleDto
            {
                ModuleId = module.ModuleId,
                ModuleName = module.ModuleName,
                Description = module.Description,
                Menus = new List<MenuHierarchyDto>()
            };
        }
    }
}