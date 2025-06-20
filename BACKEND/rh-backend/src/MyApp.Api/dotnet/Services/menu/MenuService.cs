using MyApp.Api.Models.menu;
using MyApp.Api.Entities.menu;
using MyApp.Api.Repositories.menu;

namespace MyApp.Api.Services.menu
{
    public interface IMenuService
    {
        Task<IEnumerable<MenuHierarchyDto>> GetMenuHierarchyAsync(string languageId);
        Task<IEnumerable<ModuleDto>> GetModulesAsync();
        Task<IEnumerable<ModuleDto>> GetModulesWithMenusAsync(string languageId);
    }

    public class MenuService : IMenuService
    {
        private readonly IMenuRepository _menuRepository;
        private readonly IMenuHierarchyRepository _hierarchyRepository;
        private readonly IModuleRepository _moduleRepository;
        private readonly IMenuTranslationRepository _translationRepository;

        public MenuService(
            IMenuRepository menuRepository,
            IMenuHierarchyRepository hierarchyRepository,
            IModuleRepository moduleRepository,
            IMenuTranslationRepository translationRepository)
        {
            _menuRepository = menuRepository;
            _hierarchyRepository = hierarchyRepository;
            _moduleRepository = moduleRepository;
            _translationRepository = translationRepository;
        }

        public async Task<IEnumerable<MenuHierarchyDto>> GetMenuHierarchyAsync(string languageId)
        {
            var rootHierarchies = await _hierarchyRepository.GetRootMenusAsync();
            var result = new List<MenuHierarchyDto>();

            foreach (var hierarchy in rootHierarchies)
            {
                var dto = await BuildMenuHierarchyDto(hierarchy, languageId);
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

        public async Task<IEnumerable<ModuleDto>> GetModulesWithMenusAsync(string languageId)
        {
            var modules = await _moduleRepository.GetAllAsync();
            var result = new List<ModuleDto>();

            foreach (var module in modules)
            {
                var moduleDto = MapToModuleDto(module);
                
                var moduleMenus = await _menuRepository.GetByModuleIdAsync(module.ModuleId);
                var moduleMenuHierarchies = new List<MenuHierarchyDto>();

                foreach (var menu in moduleMenus.Where(m => m.IsEnabled))
                {
                    var hierarchies = await _hierarchyRepository.GetAllAsync();
                    var menuHierarchy = hierarchies.FirstOrDefault(h => h.MenuId == menu.MenuId);
                    
                    if (menuHierarchy != null)
                    {
                        var hierarchyDto = await BuildMenuHierarchyDto(menuHierarchy, languageId);
                        if (hierarchyDto != null)
                        {
                            moduleMenuHierarchies.Add(hierarchyDto);
                        }
                    }
                }

                moduleDto.Menus = moduleMenuHierarchies.OrderBy(m => m.Menu.Position).ToList();
                result.Add(moduleDto);
            }

            return result;
        }

        private async Task<MenuHierarchyDto?> BuildMenuHierarchyDto(MenuHierarchy hierarchy, string languageId)
        {
            var menu = await _menuRepository.GetByIdAsync(hierarchy.MenuId);
            if (menu == null || !menu.IsEnabled)
                return null;

            var translation = await _translationRepository.GetByMenuAndLanguageAsync(hierarchy.MenuId, languageId);
            
            var menuDto = new MenuDto
            {
                MenuId = menu.MenuId,
                MenuKey = menu.MenuKey,
                Icon = menu.Icon,
                Link = menu.Link,
                IsEnabled = menu.IsEnabled,
                Position = menu.Position,
                ModuleId = menu.ModuleId,
                Label = translation?.Label ?? menu.MenuKey // Fallback sur MenuKey si pas de traduction
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
                var childDto = await BuildMenuHierarchyDto(childHierarchy, languageId);
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