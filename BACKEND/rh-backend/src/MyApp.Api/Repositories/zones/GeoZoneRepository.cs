using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.zones;
using MyApp.Api.Models.dto.zones;

namespace MyApp.Api.Repositories.zones
{
    public interface IGeoZoneRepository
    {
        Task<(IEnumerable<GeoZone>, int)> SearchAsync(GeoZoneSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<GeoZone>> GetAllAsync();
        Task<GeoZone?> GetByIdAsync(string id);
        Task AddAsync(GeoZone geoZone);
        Task UpdateAsync(GeoZone geoZone);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class GeoZoneRepository : IGeoZoneRepository
    {
        private readonly AppDbContext _context;

        public GeoZoneRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<GeoZone>, int)> SearchAsync(GeoZoneSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.GeoZones.AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.Name))
            {
                query = query.Where(g => g.Name.Contains(filters.Name));
            }

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderByDescending(g => g.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task<IEnumerable<GeoZone>> GetAllAsync()
        {
            return await _context.GeoZones
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();
        }

        public async Task<GeoZone?> GetByIdAsync(string id)
        {
            return await _context.GeoZones.FindAsync(id);
        }

        public async Task AddAsync(GeoZone geoZone)
        {
            geoZone.CreatedAt = DateTime.Now;
            await _context.GeoZones.AddAsync(geoZone);
        }

        public Task UpdateAsync(GeoZone geoZone)
        {
            geoZone.UpdatedAt = DateTime.Now;
            _context.GeoZones.Update(geoZone);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var gz = await GetByIdAsync(id);
            if (gz != null)
                _context.GeoZones.Remove(gz);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}