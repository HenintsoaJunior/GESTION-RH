using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IExpenseCompensationScaleRepository
    {
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<IEnumerable<ExpenseCompensationScale>> GetAllAsync();
        Task<ExpenseCompensationScale?> GetByIdAsync(string id);
        Task<IEnumerable<ExpenseCompensationScale>> GetByCriteriaAsync(ExpenseCompensationScaleDTOForm criteria);
        Task AddAsync(ExpenseCompensationScale scale);
        Task BulkAddAsync(IEnumerable<ExpenseCompensationScale> scales);
        Task UpdateAsync(ExpenseCompensationScale scale);
        Task DeleteAsync(ExpenseCompensationScale scale);
        Task BulkDeleteAsync(IEnumerable<ExpenseCompensationScale> scales);
        Task SaveChangesAsync();
    }

    public class ExpenseCompensationScaleRepository : IExpenseCompensationScaleRepository
    {
        private readonly AppDbContext _context;

        public ExpenseCompensationScaleRepository(AppDbContext context)
        {
            _context = context;
        }
        
        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }
        
        public async Task<IEnumerable<ExpenseCompensationScale>> GetAllAsync()
        {
            return await _context.ExpenseCompensationScales
                .Include(c => c.ExpenseType)
                .Include(c => c.Zone)
                .ToListAsync();
        }

        public async Task<ExpenseCompensationScale?> GetByIdAsync(string id)
        {
            return await _context.ExpenseCompensationScales
                .AsNoTracking()
                .Include(c => c.ExpenseType)
                .Include(c => c.Zone)
                .FirstOrDefaultAsync(c => c.ExpenseCompensationScaleId == id);
        }

        public async Task<IEnumerable<ExpenseCompensationScale>> GetByCriteriaAsync(ExpenseCompensationScaleDTOForm criteria)
        {
            var query = _context.ExpenseCompensationScales
                .Include(c => c.ExpenseType)
                .Include(c => c.Zone)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(criteria.ZoneId))
                query = query.Where(c => c.ZoneId == criteria.ZoneId);

            if (!string.IsNullOrWhiteSpace(criteria.ExpenseTypeId))
                query = query.Where(c => c.ExpenseTypeId == criteria.ExpenseTypeId);

            return await query
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(ExpenseCompensationScale scale)
        {
            await _context.ExpenseCompensationScales.AddAsync(scale);
        }

        public async Task BulkAddAsync(IEnumerable<ExpenseCompensationScale> scales)
        {
            await _context.ExpenseCompensationScales.AddRangeAsync(scales);
        }

        public Task UpdateAsync(ExpenseCompensationScale scale)
        {
            _context.ExpenseCompensationScales.Update(scale);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(ExpenseCompensationScale scale)
        {
            _context.ExpenseCompensationScales.Remove(scale);
            return Task.CompletedTask;
        }

        public Task BulkDeleteAsync(IEnumerable<ExpenseCompensationScale> scales)
        {
            if (scales?.Any() == true)
            {
                _context.ExpenseCompensationScales.RemoveRange(scales);
            }
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}