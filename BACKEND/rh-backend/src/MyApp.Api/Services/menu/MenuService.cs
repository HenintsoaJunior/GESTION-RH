using MyApp.Api.Entities.menu;
using MyApp.Api.Models.menu;
using MyApp.Api.Repositories.menu;

namespace MyApp.Api.Services.menu
{
    public interface IMenuService
    {
        Task<IEnumerable<MenuDto>> GetAllAsync();
        Task<MenuDto?> GetByIdAsync(string id);
        Task<MenuDto> CreateAsync(MenuDto dto);
        Task<MenuDto?> UpdateAsync(string id, MenuDto dto);
        Task<bool> DeleteAsync(string id);
    }

    public class MenuService : IMenuService
    {
        private readonly IMenuRepository _repository;

        public MenuService(IMenuRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<MenuDto>> GetAllAsync()
        {
            var menus = await _repository.GetAllAsync();
            return menus.Select(MapToDto);
        }

        public async Task<MenuDto?> GetByIdAsync(string id)
        {
            var menu = await _repository.GetByIdAsync(id);
            return menu == null ? null : MapToDto(menu);
        }

        public async Task<MenuDto> CreateAsync(MenuDto dto)
        {
            var menu = new Menu
            {
                MenuId = dto.MenuId,
                MenuKey = dto.MenuKey,
                Icon = dto.Icon,
                Link = dto.Link,
                IsEnabled = dto.IsEnabled,
                Position = dto.Position,
                ModuleId = dto.ModuleId
            };
            var created = await _repository.CreateAsync(menu);
            return MapToDto(created);
        }

        public async Task<MenuDto?> UpdateAsync(string id, MenuDto dto)
        {
            if (!await _repository.ExistsAsync(id))
                return null;

            var menu = new Menu
            {
                MenuId = id,
                MenuKey = dto.MenuKey,
                Icon = dto.Icon,
                Link = dto.Link,
                IsEnabled = dto.IsEnabled,
                Position = dto.Position,
                ModuleId = dto.ModuleId
            };

            var updated = await _repository.UpdateAsync(menu);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAsync(string id)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            await _repository.DeleteAsync(id);
            return true;
        }

        private MenuDto MapToDto(Menu menu)
        {
            return new MenuDto
            {
                MenuId = menu.MenuId,
                MenuKey = menu.MenuKey,
                Icon = menu.Icon,
                Link = menu.Link,
                IsEnabled = menu.IsEnabled,
                Position = menu.Position,
                ModuleId = menu.ModuleId
            };
        }
    }
}
