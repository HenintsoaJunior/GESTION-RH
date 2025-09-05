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
        Task DeleteAsync(MissionBudget entity);
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
            return await Task.FromResult(_context.MissionBudgets.ToList());
        }

        public async Task<MissionBudget?> GetByIdAsync(string id)
        {
            return await _context.MissionBudgets.FindAsync(id);
        }

        public async Task<MissionBudget?> GetByDirectionNameAsync(string directionName) // 👈 ajout
        {
            return await Task.FromResult(
                _context.MissionBudgets.FirstOrDefault(m => m.DirectionName == directionName)
            );
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

        public async Task DeleteAsync(MissionBudget entity)
        {
            _context.MissionBudgets.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}