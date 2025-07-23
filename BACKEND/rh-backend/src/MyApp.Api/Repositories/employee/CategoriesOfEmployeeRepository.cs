using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Repositories.employee
{
    public interface ICategoriesOfEmployeeRepository
    {
        Task<IEnumerable<CategoriesOfEmployee>> GetAllAsync();
        Task<IEnumerable<CategoriesOfEmployee>> GetByEmployeeIdBeforeDateAsync(string employeeId, DateTime date);
        Task AddAsync(CategoriesOfEmployee entity);
        void Update(CategoriesOfEmployee entity);
        void Delete(CategoriesOfEmployee entity);
        Task SaveChangesAsync();
    }


    public class CategoriesOfEmployeeRepository : ICategoriesOfEmployeeRepository
    {
        private readonly AppDbContext _context;

        public CategoriesOfEmployeeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoriesOfEmployee>> GetAllAsync()
        {
            return await _context.CategoriesOfEmployees
                .Include(c => c.EmployeeCategory)
                .ToListAsync();
        }

        public async Task<IEnumerable<CategoriesOfEmployee>> GetByEmployeeIdBeforeDateAsync(string employeeId, DateTime date)
        {
            return await _context.CategoriesOfEmployees
                .Where(c => c.EmployeeId == employeeId && c.CreatedAt <= date)
                .Include(c => c.EmployeeCategory) // include avant projection
                .GroupBy(c => c.EmployeeCategoryId)
                .Select(g => g.OrderByDescending(c => c.CreatedAt).First())
                .ToListAsync();
        }

        public async Task AddAsync(CategoriesOfEmployee entity)
        {
            await _context.CategoriesOfEmployees.AddAsync(entity);
        }

        public void Update(CategoriesOfEmployee entity)
        {
            _context.CategoriesOfEmployees.Update(entity);
        }

        public void Delete(CategoriesOfEmployee entity)
        {
            _context.CategoriesOfEmployees.Remove(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }

}
