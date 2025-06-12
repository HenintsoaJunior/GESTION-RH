using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.action_type;

namespace MyApp.Api.Repositories.action_type
{
    public interface IActionTypeRepository
    {
        Task<IEnumerable<ActionType>> GetAllAsync();
        Task<ActionType?> GetByIdAsync(string id);
        Task<ActionType> CreateAsync(ActionType actionType);
        Task<ActionType> UpdateAsync(ActionType actionType);
        Task DeleteAsync(string id);
        Task<bool> ExistsAsync(string id);
    }

    public class ActionTypeRepository : IActionTypeRepository
    {
        private readonly AppDbContext _context;

        public ActionTypeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ActionType>> GetAllAsync()
        {
            return await _context.ActionTypes.ToListAsync();
        }

        public async Task<ActionType?> GetByIdAsync(string id)
        {
            return await _context.ActionTypes.FindAsync(id);
        }

        public async Task<ActionType> CreateAsync(ActionType actionType)
        {
            _context.ActionTypes.Add(actionType);
            await _context.SaveChangesAsync();
            return actionType;
        }

        public async Task<ActionType> UpdateAsync(ActionType actionType)
        {
            _context.Entry(actionType).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return actionType;
        }

        public async Task DeleteAsync(string id)
        {
            var actionType = await _context.ActionTypes.FindAsync(id);
            if (actionType != null)
            {
                _context.ActionTypes.Remove(actionType);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await _context.ActionTypes.AnyAsync(at => at.ActionTypeId == id);
        }
    }
}