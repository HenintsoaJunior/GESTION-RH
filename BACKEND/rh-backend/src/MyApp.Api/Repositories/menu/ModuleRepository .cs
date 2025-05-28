using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.menu;

namespace MyApp.Api.Repositories.menu
{
    public interface IModuleRepository
    {
        Task<IEnumerable<Module>> GetAllAsync();
        Task<Module?> GetByIdAsync(string id);
        Task<Module> CreateAsync(Module module);
        Task<Module> UpdateAsync(Module module);
        Task DeleteAsync(string id);
        Task<bool> ExistsAsync(string id);
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

        public async Task<Module> CreateAsync(Module module)
        {
            _context.Modules.Add(module);
            await _context.SaveChangesAsync();
            return module;
        }

        public async Task<Module> UpdateAsync(Module module)
        {
            _context.Entry(module).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return module;
        }

        public async Task DeleteAsync(string id)
        {
            var module = await _context.Modules.FindAsync(id);
            if (module != null)
            {
                _context.Modules.Remove(module);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _context.Modules.AnyAsync(m => m.ModuleId == id);
        }
    }
}
