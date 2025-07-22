using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.search.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IMissionRepository
    {
        Task<(IEnumerable<Mission>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Mission>> GetAllAsync();
        Task<Mission?> GetByIdAsync(string id);
        Task AddAsync(Mission mission);
        Task UpdateAsync(Mission mission);
        Task DeleteAsync(Mission mission);
        Task SaveChangesAsync();
    }

    public class MissionRepository : IMissionRepository
    {
        private readonly AppDbContext _context;

        public MissionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<Mission>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.Missions
                .Include(m => m.Site)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.Name))
            {
                query = query.Where(m => m.Name != null && m.Name.Contains(filters.Name));
            }

            if (filters.StartDateMin.HasValue)
            {
                query = query.Where(m => m.StartDate >= filters.StartDateMin.Value);
            }

            if (filters.StartDateMax.HasValue)
            {
                query = query.Where(m => m.StartDate <= filters.StartDateMax.Value);
            }

            if (!string.IsNullOrWhiteSpace(filters.SiteId))
            {
                query = query.Where(m => m.SiteId == filters.SiteId);
            }

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderByDescending(m => m.StartDate)
                .ThenBy(m => m.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }


        public async Task<IEnumerable<Mission>> GetAllAsync()
        {
            return await _context.Missions
                .Include(m => m.Site)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<Mission?> GetByIdAsync(string id)
        {
            return await _context.Missions
                .Include(m => m.Site)
                .FirstOrDefaultAsync(m => m.MissionId == id);
        }

        public async Task AddAsync(Mission mission)
        {
            await _context.Missions.AddAsync(mission);
        }

        public Task UpdateAsync(Mission mission)
        {
            _context.Missions.Update(mission);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Mission mission)
        {
            _context.Missions.Remove(mission);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
