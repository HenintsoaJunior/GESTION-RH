using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.direction;

namespace MyApp.Api.Repositories.direction
{
    public interface IDirectionRepository
    {
        Task<IEnumerable<Direction>> GetAllAsync();
        Task<Direction?> GetByIdAsync(string id);
        Task AddAsync(Direction direction);
        Task UpdateAsync(Direction direction);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class DirectionRepository : IDirectionRepository
    {
        private readonly AppDbContext _context;

        public DirectionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Direction>> GetAllAsync()
        {
            return await _context.Directions
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<Direction?> GetByIdAsync(string id)
        {
            return await _context.Directions.FindAsync(id);
        }

        public async Task AddAsync(Direction direction)
        {
            direction.CreatedAt = DateTime.Now;
            await _context.Directions.AddAsync(direction);
        }

        public Task UpdateAsync(Direction direction)
        {
            direction.UpdatedAt = DateTime.Now;
            _context.Directions.Update(direction);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var dir = await GetByIdAsync(id);
            if (dir != null)
                _context.Directions.Remove(dir);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
