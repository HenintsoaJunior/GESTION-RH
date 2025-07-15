using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Repositories.employee
{
    public interface IEmployeeRepository
    {
        Task<IEnumerable<Employee>> GetAllAsync();
        Task<Employee?> GetByIdAsync(string id);
        Task<IEnumerable<Employee>> GetByGenderAsync(string genderId);
        Task<IEnumerable<Employee>> GetByStatusAsync(string status);
        Task AddAsync(Employee employee);
        Task UpdateAsync(Employee employee);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly AppDbContext _context;

        public EmployeeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            return await _context.Employees
                .Include(e => e.Unit)
                .Include(e => e.Service)
                .Include(e => e.Department)
                .Include(e => e.Direction)
                .Include(e => e.WorkingTimeType)
                .Include(e => e.EmployeeCategory)
                .Include(e => e.ContractType)
                .Include(e => e.Gender)
                .Include(e => e.MaritalStatus)
                .Include(e => e.Site)
                .ToListAsync();
        }

        public async Task<Employee?> GetByIdAsync(string id)
        {
            return await _context.Employees
                .Include(e => e.Unit)
                .Include(e => e.Service)
                .Include(e => e.Department)
                .Include(e => e.Direction)
                .Include(e => e.WorkingTimeType)
                .Include(e => e.EmployeeCategory)
                .Include(e => e.ContractType)
                .Include(e => e.Gender)
                .Include(e => e.MaritalStatus)
                .Include(e => e.Site)
                .FirstOrDefaultAsync(e => e.EmployeeId == id);
        }

        public async Task<IEnumerable<Employee>> GetByGenderAsync(string genderId)
        {
            return await _context.Employees
                .Where(e => e.GenderId == genderId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Employee>> GetByStatusAsync(string status)
        {
            return await _context.Employees
                .Where(e => e.Status == status)
                .ToListAsync();
        }

        public async Task AddAsync(Employee employee)
        {
            await _context.Employees.AddAsync(employee);
        }

        public Task UpdateAsync(Employee employee)
        {
            _context.Employees.Update(employee);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var employee = await GetByIdAsync(id);
            if (employee != null)
                _context.Employees.Remove(employee);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
