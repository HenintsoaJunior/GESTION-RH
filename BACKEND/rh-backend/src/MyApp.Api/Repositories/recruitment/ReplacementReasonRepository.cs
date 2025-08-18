using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IReplacementReasonRepository
    {
        Task<IEnumerable<ReplacementReason>> GetAllAsync();
        Task<ReplacementReason?> GetByIdAsync(string id);
        Task AddAsync(ReplacementReason reason);
        Task UpdateAsync(ReplacementReason reason);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class ReplacementReasonRepository : IReplacementReasonRepository
    {
        private readonly AppDbContext _context;

        public ReplacementReasonRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReplacementReason>> GetAllAsync()
        {
            return await _context.ReplacementReasons
                .OrderBy(r => r.Name)
                .ToListAsync();
        }

        public async Task<ReplacementReason?> GetByIdAsync(string id)
        {
            return await _context.ReplacementReasons.FindAsync(id);
        }

        public async Task AddAsync(ReplacementReason reason)
        {
            await _context.ReplacementReasons.AddAsync(reason);
        }

        public Task UpdateAsync(ReplacementReason reason)
        {
            _context.ReplacementReasons.Update(reason);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var existing = await GetByIdAsync(id);
            if (existing != null)
                _context.ReplacementReasons.Remove(existing);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
