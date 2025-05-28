using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.menu;

namespace MyApp.Api.Repositories.menu
{
    public interface IMenuTranslationRepository
    {
        Task<IEnumerable<MenuTranslation>> GetAllAsync();
        Task<MenuTranslation?> GetByIdAsync(string id);
        Task<MenuTranslation> CreateAsync(MenuTranslation translation);
        Task<MenuTranslation> UpdateAsync(MenuTranslation translation);
        Task DeleteAsync(string id);
        Task<bool> ExistsAsync(string id);
    }

    public class MenuTranslationRepository : IMenuTranslationRepository
    {
        private readonly AppDbContext _context;

        public MenuTranslationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MenuTranslation>> GetAllAsync()
        {
            return await _context.MenuTranslations.ToListAsync();
        }

        public async Task<MenuTranslation?> GetByIdAsync(string id)
        {
            return await _context.MenuTranslations.FindAsync(id);
        }

        public async Task<MenuTranslation> CreateAsync(MenuTranslation translation)
        {
            _context.MenuTranslations.Add(translation);
            await _context.SaveChangesAsync();
            return translation;
        }

        public async Task<MenuTranslation> UpdateAsync(MenuTranslation translation)
        {
            _context.Entry(translation).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return translation;
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await _context.MenuTranslations.FindAsync(id);
            if (entity != null)
            {
                _context.MenuTranslations.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _context.MenuTranslations.AnyAsync(t => t.TranslationId == id);
        }
    }
}
