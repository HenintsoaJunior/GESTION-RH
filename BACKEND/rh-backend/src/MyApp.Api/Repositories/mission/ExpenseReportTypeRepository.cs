using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IExpenseReportTypeRepository
    {
        Task<IEnumerable<ExpenseReportType>> GetAllAsync();
        Task<ExpenseReportType?> GetByIdAsync(string id);
        Task AddAsync(ExpenseReportType entity);
        Task UpdateAsync(ExpenseReportType entity);
        Task DeleteAsync(ExpenseReportType entity);
        Task SaveChangesAsync();
    }

    public class ExpenseReportTypeRepository : IExpenseReportTypeRepository
    {
        private readonly AppDbContext _context;

        public ExpenseReportTypeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ExpenseReportType>> GetAllAsync()
        {
            return await _context.ExpenseReportTypes
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<ExpenseReportType?> GetByIdAsync(string id)
        {
            return await _context.ExpenseReportTypes
                .AsNoTracking()
                .FirstOrDefaultAsync(ert => ert.ExpenseReportTypeId == id);
        }

        public async Task AddAsync(ExpenseReportType entity)
        {
            await _context.ExpenseReportTypes.AddAsync(entity);
        }

        public Task UpdateAsync(ExpenseReportType entity)
        {
            _context.ExpenseReportTypes.Update(entity);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(ExpenseReportType entity)
        {
            var entry = _context.Entry(entity);
            if (entry.State != EntityState.Detached)
            {
                entry.State = EntityState.Detached;
            }

        
            _context.ExpenseReportTypes.Remove(entity);
            await Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}