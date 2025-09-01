using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.logs;
using MyApp.Api.Models.dto.logs;

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
        
        Task<(IEnumerable<Log>, int)> SearchAsync(LogSearchFiltersDTO filters, int page, int pageSize);
    }

    public class LogRepository : ILogRepository
    {
        private readonly AppDbContext _context;

        public LogRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<Log>, int)> SearchAsync(LogSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.Logs
                .Include(l => l.User)
                .AsQueryable();

            // Filtre par action
            if (!string.IsNullOrWhiteSpace(filters.Action))
            {
                query = query.Where(l => l.Action.Contains(filters.Action));
            }

            // Filtre par nom de table
            if (!string.IsNullOrWhiteSpace(filters.TableName))
            {
                query = query.Where(l => l.TableName!.Contains(filters.TableName));
            }

            // Filtre par UserId
            if (!string.IsNullOrWhiteSpace(filters.UserId))
            {
                query = query.Where(l => l.UserId == filters.UserId);
            }

            // Filtre par date de création
            if (filters.MinCreatedAt.HasValue)
            {
                query = query.Where(l => l.CreatedAt >= filters.MinCreatedAt.Value);
            }
            if (filters.MaxCreatedAt.HasValue)
            {
                query = query.Where(l => l.CreatedAt <= filters.MaxCreatedAt.Value);
            }

            // Nombre total de résultats
            var totalCount = await query.CountAsync();

           
            var results = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
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