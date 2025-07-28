using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.direction;

namespace MyApp.Api.Repositories.direction
{
    public interface IUnitRepository
    {
        Task<IEnumerable<Unit>> GetAllAsync();
        Task<Unit?> GetByIdAsync(string id);
        Task<IEnumerable<Unit>> GetByServiceAsync(string serviceId);
        Task AddAsync(Unit unit);
        Task UpdateAsync(Unit unit);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class UnitRepository : IUnitRepository
    {
        private readonly AppDbContext _context;

        public UnitRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Unit>> GetAllAsync()
        {
            return await _context.Units
                .Include(u => u.Service)
                .ToListAsync();
        }

        public async Task<Unit?> GetByIdAsync(string id)
        {
            return await _context.Units
                .Include(u => u.Service)
                .FirstOrDefaultAsync(u => u.UnitId == id);
        }

        public async Task<IEnumerable<Unit>> GetByServiceAsync(string serviceId)
        {
            return await _context.Units
                .Where(u => u.ServiceId == serviceId)
                .ToListAsync();
        }

        public async Task AddAsync(Unit unit)
        {
            await _context.Units.AddAsync(unit);
        }

        public Task UpdateAsync(Unit unit)
        {
            _context.Units.Update(unit);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var unit = await GetByIdAsync(id);
            if (unit != null)
                _context.Units.Remove(unit);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}