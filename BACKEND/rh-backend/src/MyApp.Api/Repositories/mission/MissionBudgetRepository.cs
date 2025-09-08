using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IMissionBudgetRepository
    {
        Task<IEnumerable<MissionBudget>> GetAllAsync();
        Task<MissionBudget?> GetByIdAsync(string id);
        Task<MissionBudget?> GetByDirectionNameAsync(string directionName);
        Task AddAsync(MissionBudget entity);
        Task UpdateAsync(MissionBudget entity);
        Task DeleteAsync(string id);
    }

    public class MissionBudgetRepository : IMissionBudgetRepository
    {
        private readonly AppDbContext _context;

        public MissionBudgetRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MissionBudget>> GetAllAsync()
        {
            return await _context.MissionBudgets
                .Include(m => m.User)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<MissionBudget?> GetByIdAsync(string id)
        {
            return await _context.MissionBudgets
                        .AsNoTracking()
                        .FirstOrDefaultAsync(m => m.MissionBudgetId == id);
        }

        public async Task<MissionBudget?> GetByDirectionNameAsync(string directionName)
        {
            return await _context.MissionBudgets
                .Where(m => m.DirectionName == directionName)
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefaultAsync();
        }


        public async Task AddAsync(MissionBudget entity)
        {
            await _context.MissionBudgets.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(MissionBudget entity)
        {
            _context.MissionBudgets.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await _context.MissionBudgets.FindAsync(id);
            if (entity != null) _context.MissionBudgets.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}