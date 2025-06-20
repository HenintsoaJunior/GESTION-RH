using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.menu;

namespace MyApp.Api.Repositories.menu
{
    public interface ILanguageRepository
    {
        Task<IEnumerable<Language>> GetAllAsync();
        Task<Language?> GetByIdAsync(string id);
        Task<Language> CreateAsync(Language language);
        Task<Language> UpdateAsync(Language language);
        Task DeleteAsync(string id);
        Task<bool> ExistsAsync(string id);
    }

    public class LanguageRepository : ILanguageRepository
    {
        private readonly AppDbContext _context;

        public LanguageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Language>> GetAllAsync()
        {
            return await _context.Languages.ToListAsync();
        }

        public async Task<Language?> GetByIdAsync(string id)
        {
            return await _context.Languages.FindAsync(id);
        }

        public async Task<Language> CreateAsync(Language language)
        {
            _context.Languages.Add(language);
            await _context.SaveChangesAsync();
            return language;
        }

        public async Task<Language> UpdateAsync(Language language)
        {
            _context.Entry(language).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return language;
        }

        public async Task DeleteAsync(string id)
        {
            var language = await _context.Languages.FindAsync(id);
            if (language != null)
            {
                _context.Languages.Remove(language);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _context.Languages.AnyAsync(l => l.LanguageId == id);
        }
    }
}
