using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.logs;

namespace MyApp.Api.Repositories.logs
{
    public interface ILogRepository
    {
        Task<IEnumerable<Log>> GetAllAsync();
        Task<Log?> GetByIdAsync(string logId);
        Task AddAsync(Log log);
        Task UpdateAsync(Log log);
        Task DeleteAsync(string logId);
        Task SaveChangesAsync();
    }

    public class LogRepository : ILogRepository
    {
        private readonly AppDbContext _context;

        public LogRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Log>> GetAllAsync()
        {
            return await _context.Logs
                .Include(l => l.User)
                .OrderByDescending(l => l.CreatedAt)
                .ToListAsync();
        }

        public async Task<Log?> GetByIdAsync(string logId)
        {
            return await _context.Logs
                .Include(l => l.User)
                .FirstOrDefaultAsync(l => l.LogId == logId);
        }

        public async Task AddAsync(Log log)
        {
            await _context.Logs.AddAsync(log);
        }

        public Task UpdateAsync(Log log)
        {
            _context.Logs.Update(log);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string logId)
        {
            var log = await GetByIdAsync(logId);
            if (log != null)
                _context.Logs.Remove(log);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}