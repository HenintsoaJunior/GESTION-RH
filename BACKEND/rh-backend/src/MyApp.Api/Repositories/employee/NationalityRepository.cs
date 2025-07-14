using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Repositories.employee
{
    public interface INationalityRepository
    {
        Task<IEnumerable<Nationality>> GetAllAsync();
        Task<Nationality?> GetByIdAsync(string id);
        Task AddAsync(Nationality nationality);
        Task UpdateAsync(Nationality nationality);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class NationalityRepository : INationalityRepository
    {
        private readonly AppDbContext _context;

        public NationalityRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Nationality>> GetAllAsync()
        {
            return await _context.Nationalities
                .OrderBy(n => n.Name)
                .ToListAsync();
        }

        public async Task<Nationality?> GetByIdAsync(string id)
        {
            return await _context.Nationalities.FindAsync(id);
        }

        public async Task AddAsync(Nationality nationality)
        {
            await _context.Nationalities.AddAsync(nationality);
        }

        public Task UpdateAsync(Nationality nationality)
        {
            _context.Nationalities.Update(nationality);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var existing = await GetByIdAsync(id);
            if (existing != null)
                _context.Nationalities.Remove(existing);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
