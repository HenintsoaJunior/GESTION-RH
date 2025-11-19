using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.tmp;

namespace MyApp.Api.Repositories.tmp
{
    public interface ITmpEmployeeRepository
    {
        Task<IEnumerable<TmpEmployee>> GetAllAsync();
        Task<TmpEmployee?> GetByIdAsync(string id);
        Task AddAsync(TmpEmployee employee);
        Task SaveChangesAsync();
    }

    public class TmpEmployeeRepository : ITmpEmployeeRepository
    {
        private readonly AppDbContext _context;

        public TmpEmployeeRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<TmpEmployee>> GetAllAsync()
        {
            return await _context.TmpEmployees.ToListAsync();
        }

        public async Task<TmpEmployee?> GetByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return null;
            }
            return await _context.TmpEmployees.FirstOrDefaultAsync(e => e.TmpEmployeeId == id);
        }

        public async Task AddAsync(TmpEmployee employee)
        {
            if (employee == null)
            {
                throw new ArgumentNullException(nameof(employee));
            }
            await _context.TmpEmployees.AddAsync(employee);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}