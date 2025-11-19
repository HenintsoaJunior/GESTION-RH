using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.dto.direction;

namespace MyApp.Api.Repositories.direction
{
    public interface IDirectionRepository
    {
        Task<(IEnumerable<Direction>, int)> SearchAsync(DirectionSearchFiltersDTO filters, int page, int pageSize);
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

        public async Task<(IEnumerable<Direction>, int)> SearchAsync(DirectionSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.Directions.AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.Name))
            {
                query = query.Where(d => d.DirectionName.Contains(filters.Name));
            }

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderByDescending(d => d.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
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
