using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.menu;

namespace MyApp.Api.Repositories.menu
{
    public interface IMenuHierarchyRepository
    {
        Task<IEnumerable<MenuHierarchy>> GetAllAsync();
        Task<MenuHierarchy?> GetByIdAsync(string id);
        Task<MenuHierarchy> CreateAsync(MenuHierarchy hierarchy);
        Task<MenuHierarchy> UpdateAsync(MenuHierarchy hierarchy);
        Task DeleteAsync(string id);
        Task<bool> ExistsAsync(string id);
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

        public async Task<MenuHierarchy?> GetByIdAsync(string id)
        {
            return await _context.MenuHierarchies.FindAsync(id);
        }

        public async Task<MenuHierarchy> CreateAsync(MenuHierarchy hierarchy)
        {
            _context.MenuHierarchies.Add(hierarchy);
            await _context.SaveChangesAsync();
            return hierarchy;
        }

        public async Task<MenuHierarchy> UpdateAsync(MenuHierarchy hierarchy)
        {
            _context.Entry(hierarchy).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return hierarchy;
        }

        public async Task DeleteAsync(string id)
        {
            var h = await _context.MenuHierarchies.FindAsync(id);
            if (h != null)
            {
                _context.MenuHierarchies.Remove(h);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _context.MenuHierarchies.AnyAsync(h => h.HierarchyId == id);
        }
    }
}
