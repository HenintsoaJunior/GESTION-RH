
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IExpenseTypeRepository
    {
        Task<IEnumerable<ExpenseType>> GetAllAsync();
        Task<ExpenseType?> GetByIdAsync(string id);
        Task AddAsync(ExpenseType expenseType);
        Task UpdateAsync(ExpenseType expenseType);
        Task DeleteAsync(ExpenseType expenseType);
        Task SaveChangesAsync();
    }
    
    public class ExpenseTypeRepository : IExpenseTypeRepository
    {
        private readonly AppDbContext _context;

        public ExpenseTypeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ExpenseType>> GetAllAsync()
        {
            return await _context.ExpenseTypes
                .OrderBy(e => e.Type)
                .ToListAsync();
        }

        public async Task<ExpenseType?> GetByIdAsync(string id)
        {
            return await _context.ExpenseTypes.FindAsync(id);
        }

        public async Task AddAsync(ExpenseType expenseType)
        {
            await _context.ExpenseTypes.AddAsync(expenseType);
        }

        public Task UpdateAsync(ExpenseType expenseType)
        {
            _context.ExpenseTypes.Update(expenseType);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(ExpenseType expenseType)
        {
            _context.ExpenseTypes.Remove(expenseType);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}

