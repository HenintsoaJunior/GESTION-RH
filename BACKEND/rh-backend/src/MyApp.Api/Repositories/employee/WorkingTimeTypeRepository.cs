using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Repositories.employee
{
    public interface IWorkingTimeTypeRepository
    {
        Task<IEnumerable<WorkingTimeType>> GetAllAsync();
        Task<WorkingTimeType?> GetByIdAsync(string id);
        Task AddAsync(WorkingTimeType type);
        Task UpdateAsync(WorkingTimeType type);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class WorkingTimeTypeRepository : IWorkingTimeTypeRepository
    {
        private readonly AppDbContext _context;

        public WorkingTimeTypeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<WorkingTimeType>> GetAllAsync()
        {
            return await _context.WorkingTimeTypes
                .OrderBy(w => w.Label)
                .ToListAsync();
        }

        public async Task<WorkingTimeType?> GetByIdAsync(string id)
        {
            return await _context.WorkingTimeTypes.FindAsync(id);
        }

        public async Task AddAsync(WorkingTimeType type)
        {
            await _context.WorkingTimeTypes.AddAsync(type);
        }

        public Task UpdateAsync(WorkingTimeType type)
        {
            _context.WorkingTimeTypes.Update(type);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
                _context.WorkingTimeTypes.Remove(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
