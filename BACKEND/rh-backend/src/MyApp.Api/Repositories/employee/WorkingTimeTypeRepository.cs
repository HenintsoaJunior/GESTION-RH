using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Repositories.employee
{
    public interface IWorkingTimeTypeRepository
    {
        Task<IEnumerable<WorkingTimeType>> GetAllAsync();
        Task<WorkingTimeType?> GetByIdAsync(string id);
        Task AddAsync(WorkingTimeType workingTimeType);
        Task UpdateAsync(WorkingTimeType workingTimeType);
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
                .ToListAsync();
        }

        public async Task<WorkingTimeType?> GetByIdAsync(string id)
        {
            return await _context.WorkingTimeTypes
                .FirstOrDefaultAsync(w => w.WorkingTimeTypeId == id);
        }

        public async Task AddAsync(WorkingTimeType workingTimeType)
        {
            await _context.WorkingTimeTypes.AddAsync(workingTimeType);
        }

        public Task UpdateAsync(WorkingTimeType workingTimeType)
        {
            _context.WorkingTimeTypes.Update(workingTimeType);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var workingTimeType = await GetByIdAsync(id);
            if (workingTimeType != null)
                _context.WorkingTimeTypes.Remove(workingTimeType);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}