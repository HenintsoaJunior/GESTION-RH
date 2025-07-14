using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;


namespace MyApp.Api.Repositories.employee
{
    public interface IEmployeeCategoryRepository
    {
        Task<IEnumerable<EmployeeCategory>> GetAllAsync();
        Task<EmployeeCategory?> GetByIdAsync(string id);
        Task AddAsync(EmployeeCategory category);
        Task UpdateAsync(EmployeeCategory category);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class EmployeeCategoryRepository : IEmployeeCategoryRepository
    {
        private readonly AppDbContext _context;

        public EmployeeCategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EmployeeCategory>> GetAllAsync()
        {
            return await _context.EmployeeCategories
                .OrderBy(e => e.Label)
                .ToListAsync();
        }

        public async Task<EmployeeCategory?> GetByIdAsync(string id)
        {
            return await _context.EmployeeCategories.FindAsync(id);
        }

        public async Task AddAsync(EmployeeCategory category)
        {
            await _context.EmployeeCategories.AddAsync(category);
        }

        public Task UpdateAsync(EmployeeCategory category)
        {
            _context.EmployeeCategories.Update(category);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
                _context.EmployeeCategories.Remove(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
