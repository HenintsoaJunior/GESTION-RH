using MyApp.Api.Entities.menu;
using MyApp.Api.Models.menu;
using MyApp.Api.Repositories.menu;

namespace MyApp.Api.Services.menu
{
    public interface IMenuHierarchyService
    {
        Task<IEnumerable<MenuHierarchyDto>> GetAllAsync();
        Task<MenuHierarchyDto?> GetByIdAsync(string id);
        Task<MenuHierarchyDto> CreateAsync(MenuHierarchyDto dto);
        Task<MenuHierarchyDto?> UpdateAsync(string id, MenuHierarchyDto dto);
        Task<bool> DeleteAsync(string id);
    }

    public class MenuHierarchyService : IMenuHierarchyService
    {
        private readonly IMenuHierarchyRepository _repository;

        public MenuHierarchyService(IMenuHierarchyRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<MenuHierarchyDto>> GetAllAsync()
        {
            var list = await _repository.GetAllAsync();
            return list.Select(MapToDto);
        }

        public async Task<MenuHierarchyDto?> GetByIdAsync(string id)
        {
            var item = await _repository.GetByIdAsync(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<MenuHierarchyDto> CreateAsync(MenuHierarchyDto dto)
        {
            var entity = new MenuHierarchy
            {
                HierarchyId = dto.HierarchyId,
                ParentMenuId = dto.ParentMenuId,
                MenuId = dto.MenuId
            };
            var created = await _repository.CreateAsync(entity);
            return MapToDto(created);
        }

        public async Task<MenuHierarchyDto?> UpdateAsync(string id, MenuHierarchyDto dto)
        {
            if (!await _repository.ExistsAsync(id))
                return null;

            var entity = new MenuHierarchy
            {
                HierarchyId = id,
                ParentMenuId = dto.ParentMenuId,
                MenuId = dto.MenuId
            };
            var updated = await _repository.UpdateAsync(entity);
            return MapToDto(updated);
        }

        public async Task<bool> DeleteAsync(string id)
        {
            if (!await _repository.ExistsAsync(id))
                return false;

            await _repository.DeleteAsync(id);
            return true;
        }

        private MenuHierarchyDto MapToDto(MenuHierarchy e)
        {
            return new MenuHierarchyDto
            {
                HierarchyId = e.HierarchyId,
                ParentMenuId = e.ParentMenuId,
                MenuId = e.MenuId
            };
        }
    }
}
