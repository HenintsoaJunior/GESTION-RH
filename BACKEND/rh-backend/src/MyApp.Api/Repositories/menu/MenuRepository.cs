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

    public interface IMenuTranslationRepository
    {
        Task<IEnumerable<MenuTranslation>> GetByLanguageIdAsync(string languageId);
        Task<MenuTranslation?> GetByMenuAndLanguageAsync(string menuId, string languageId);
        Task<IEnumerable<MenuTranslation>> GetByMenuIdAsync(string menuId);
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

    public class MenuTranslationRepository : IMenuTranslationRepository
    {
        private readonly AppDbContext _context;

        public MenuTranslationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MenuTranslation>> GetByLanguageIdAsync(string languageId)
        {
            return await _context.MenuTranslations
                .Where(mt => mt.LanguageId == languageId)
                .ToListAsync();
        }

        public async Task<MenuTranslation?> GetByMenuAndLanguageAsync(string menuId, string languageId)
        {
            return await _context.MenuTranslations
                .FirstOrDefaultAsync(mt => mt.MenuId == menuId && mt.LanguageId == languageId);
        }

        public async Task<IEnumerable<MenuTranslation>> GetByMenuIdAsync(string menuId)
        {
            return await _context.MenuTranslations
                .Where(mt => mt.MenuId == menuId)
                .ToListAsync();
        }
    }
}