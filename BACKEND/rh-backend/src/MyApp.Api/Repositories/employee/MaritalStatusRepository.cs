using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Repositories.employee
{
    public interface IMaritalStatusRepository
    {
        Task<IEnumerable<MaritalStatus>> GetAllAsync();
        Task<MaritalStatus?> GetByIdAsync(string id);
        Task AddAsync(MaritalStatus status);
        Task UpdateAsync(MaritalStatus status);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class MaritalStatusRepository : IMaritalStatusRepository
    {
        private readonly AppDbContext _context;

        public MaritalStatusRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MaritalStatus>> GetAllAsync()
        {
            return await _context.MaritalStatuses
                .OrderBy(m => m.Label)
                .ToListAsync();
        }

        public async Task<MaritalStatus?> GetByIdAsync(string id)
        {
            return await _context.MaritalStatuses.FindAsync(id);
        }

        public async Task AddAsync(MaritalStatus status)
        {
            await _context.MaritalStatuses.AddAsync(status);
        }

        public Task UpdateAsync(MaritalStatus status)
        {
            _context.MaritalStatuses.Update(status);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
                _context.MaritalStatuses.Remove(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
