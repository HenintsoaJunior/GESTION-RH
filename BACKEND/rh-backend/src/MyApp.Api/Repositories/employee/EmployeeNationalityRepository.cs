using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Repositories.employee
{
    public interface IEmployeeNationalityRepository
    {
        Task<IEnumerable<EmployeeNationality>> GetByEmployeeIdAsync(string employeeId);
        Task<IEnumerable<EmployeeNationality>> GetByNationalityIdAsync(string nationalityId);
        Task AddAsync(EmployeeNationality entity);
        Task RemoveAsync(EmployeeNationality entity);
        Task SaveChangesAsync();
    }

    public class EmployeeNationalityRepository : IEmployeeNationalityRepository
    {
        private readonly AppDbContext _context;

        public EmployeeNationalityRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EmployeeNationality>> GetByEmployeeIdAsync(string employeeId)
        {
            return await _context.EmployeeNationalities
                .Where(e => e.EmployeeId == employeeId)
                .Include(e => e.Nationality)
                .ToListAsync();
        }

        public async Task<IEnumerable<EmployeeNationality>> GetByNationalityIdAsync(string nationalityId)
        {
            return await _context.EmployeeNationalities
                .Where(e => e.NationalityId == nationalityId)
                .Include(e => e.Employee)
                .ToListAsync();
        }

        public async Task AddAsync(EmployeeNationality entity)
        {
            await _context.EmployeeNationalities.AddAsync(entity);
        }

        public Task RemoveAsync(EmployeeNationality entity)
        {
            _context.EmployeeNationalities.Remove(entity);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
