using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Repositories.employee
{
    public interface IMaritalStatusRepository
    {
        Task<IEnumerable<MaritalStatus>> GetAllAsync();
        Task<MaritalStatus?> GetByIdAsync(string id);
        Task AddAsync(MaritalStatus maritalStatus);
        Task UpdateAsync(MaritalStatus maritalStatus);
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
                .ToListAsync();
        }

        public async Task<MaritalStatus?> GetByIdAsync(string id)
        {
            return await _context.MaritalStatuses
                .FirstOrDefaultAsync(m => m.MaritalStatusId == id);
        }

        public async Task AddAsync(MaritalStatus maritalStatus)
        {
            await _context.MaritalStatuses.AddAsync(maritalStatus);
        }

        public Task UpdateAsync(MaritalStatus maritalStatus)
        {
            _context.MaritalStatuses.Update(maritalStatus);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var maritalStatus = await GetByIdAsync(id);
            if (maritalStatus != null)
                _context.MaritalStatuses.Remove(maritalStatus);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}