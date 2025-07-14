using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.direction;

namespace MyApp.Api.Repositories.direction
{
    public interface IDepartmentRepository
    {
        Task<IEnumerable<Department>> GetAllAsync();
        Task<Department?> GetByIdAsync(string id);
        Task AddAsync(Department department);
        Task UpdateAsync(Department department);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class DepartmentRepository : IDepartmentRepository
    {
        private readonly AppDbContext _context;

        public DepartmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Department>> GetAllAsync()
        {
            return await _context.Departments
                .Include(d => d.Direction)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<Department?> GetByIdAsync(string id)
        {
            return await _context.Departments
                .Include(d => d.Direction)
                .FirstOrDefaultAsync(d => d.DepartmentId == id);
        }

        public async Task AddAsync(Department department)
        {
            department.CreatedAt = DateTime.Now;
            await _context.Departments.AddAsync(department);
        }

        public Task UpdateAsync(Department department)
        {
            department.UpdatedAt = DateTime.Now;
            _context.Departments.Update(department);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var department = await GetByIdAsync(id);
            if (department != null)
                _context.Departments.Remove(department);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
