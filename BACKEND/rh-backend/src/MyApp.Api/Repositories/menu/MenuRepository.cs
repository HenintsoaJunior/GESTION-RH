using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.menu;

namespace MyApp.Api.Repositories.menu
{
    public interface IMenuRepository
    {
        Task<IEnumerable<Menu>> GetAllAsync();
        Task<Menu?> GetByIdAsync(string id);
        Task<IEnumerable<Menu>> GetByModuleIdAsync(string moduleId);
        Task<IEnumerable<Menu>> GetEnabledMenusAsync();
        Task<IEnumerable<Menu>> GetAllWithRolesAsync(string[]? roleNames = null); // Updated to accept string array
    }

    public interface IMenuHierarchyRepository
    {
        Task<IEnumerable<MenuHierarchy>> GetAllAsync();
        Task<IEnumerable<MenuHierarchy>> GetByParentIdAsync(string? parentId);
        Task<IEnumerable<MenuHierarchy>> GetRootMenusAsync();
    }

    public interface IModuleRepository
    {
        Task<IEnumerable<Module>> GetAllAsync();
        Task<Module?> GetByIdAsync(string id);
    }

    public class MenuRepository : IMenuRepository
    {
        private readonly AppDbContext _context;

        public MenuRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Menu>> GetAllAsync()
        {
            return await _context.Menus.OrderBy(m => m.Position).ToListAsync();
        }

        
        public async Task<Menu?> GetByIdAsync(string id)
        {
            return await _context.Menus.FindAsync(id);
        }

        public async Task<IEnumerable<Menu>> GetByModuleIdAsync(string moduleId)
        {
            return await _context.Menus
                .Where(m => m.ModuleId == moduleId)
                .OrderBy(m => m.Position)
                .ToListAsync();
        }

        public async Task<IEnumerable<Menu>> GetEnabledMenusAsync()
        {
            return await _context.Menus
                .Where(m => m.IsEnabled)
                .OrderBy(m => m.Position)
                .ToListAsync();
        }

        public async Task<IEnumerable<Menu>> GetAllWithRolesAsync(string[]? roleNames = null)
        {
            var query = _context.Menus
                .Include(m => m.MenuRoles)
                .ThenInclude(mr => mr.Role)
                .AsQueryable();

            if (roleNames != null && roleNames.Length > 0)
            {
                query = query.Where(m => m.MenuRoles.Any(mr => roleNames.Contains(mr.Role.Name)));
            }

            return await query.OrderBy(m => m.Position).ToListAsync();
        }
    }

    public class MenuHierarchyRepository : IMenuHierarchyRepository
    {
        private readonly AppDbContext _context;

        public MenuHierarchyRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MenuHierarchy>> GetAllAsync()
        {
            return await _context.MenuHierarchies.ToListAsync();
        }

        public async Task<IEnumerable<MenuHierarchy>> GetByParentIdAsync(string? parentId)
        {
            return await _context.MenuHierarchies
                .Where(mh => mh.ParentMenuId == parentId)
                .ToListAsync();
        }

        public async Task<IEnumerable<MenuHierarchy>> GetRootMenusAsync()
        {
            return await _context.MenuHierarchies
                .Where(mh => mh.ParentMenuId == null)
                .ToListAsync();
        }
    }

    public class ModuleRepository : IModuleRepository
    {
        private readonly AppDbContext _context;

        public ModuleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Module>> GetAllAsync()
        {
            return await _context.Modules.ToListAsync();
        }

        public async Task<Module?> GetByIdAsync(string id)
        {
            return await _context.Modules.FindAsync(id);
        }
    }
}