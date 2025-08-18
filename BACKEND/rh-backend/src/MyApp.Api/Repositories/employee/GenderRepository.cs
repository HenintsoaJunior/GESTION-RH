using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Repositories.employee
{
    public interface IGenderRepository
    {
        Task<IEnumerable<Gender>> GetAllAsync();
        Task<Gender?> GetByIdAsync(string id);
        Task AddAsync(Gender gender);
        Task UpdateAsync(Gender gender);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class GenderRepository : IGenderRepository
    {
        private readonly AppDbContext _context;

        public GenderRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Gender>> GetAllAsync()
        {
            return await _context.Genders
                .ToListAsync();
        }

        public async Task<Gender?> GetByIdAsync(string id)
        {
            return await _context.Genders
                .FirstOrDefaultAsync(g => g.GenderId == id);
        }

        public async Task AddAsync(Gender gender)
        {
            await _context.Genders.AddAsync(gender);
        }

        public Task UpdateAsync(Gender gender)
        {
            _context.Genders.Update(gender);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var gender = await GetByIdAsync(id);
            if (gender != null)
                _context.Genders.Remove(gender);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}