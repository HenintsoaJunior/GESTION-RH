using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.dto.direction;

namespace MyApp.Api.Repositories.direction
{
    public interface IServiceRepository
    {
        Task<(IEnumerable<Service>, int)> SearchAsync(ServiceSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Service>> GetAllAsync();
        Task<Service?> GetByIdAsync(string id);
        Task AddAsync(Service service);
        Task UpdateAsync(Service service);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class ServiceRepository : IServiceRepository
    {
        private readonly AppDbContext _context;

        public ServiceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<Service>, int)> SearchAsync(ServiceSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.Services.Include(s => s.Department).AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.Name))
            {
                query = query.Where(s => s.ServiceName.Contains(filters.Name));
            }

            if (!string.IsNullOrWhiteSpace(filters.DepartmentId))
            {
                query = query.Where(s => s.DepartmentId == filters.DepartmentId);
            }

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderByDescending(s => s.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task<IEnumerable<Service>> GetAllAsync()
        {
            return await _context.Services
                .Include(s => s.Department)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();
        }

        public async Task<Service?> GetByIdAsync(string id)
        {
            return await _context.Services
                .Include(s => s.Department)
                .FirstOrDefaultAsync(s => s.ServiceId == id);
        }

        public async Task AddAsync(Service service)
        {
            service.CreatedAt = DateTime.Now;
            await _context.Services.AddAsync(service);
        }

        public async Task UpdateAsync(Service updatedService)
        {
            var existing = await _context.Services.FindAsync(updatedService.ServiceId);
            if (existing == null)
            {
                throw new InvalidOperationException($"Service with ID {updatedService.ServiceId} not found.");
            }

            _context.Entry(existing).CurrentValues.SetValues(updatedService);
            existing.UpdatedAt = DateTime.Now;

            // Note: This assumes navigation properties like Department are not updated here.
            // If needed, handle separately (e.g., update DepartmentId and let EF handle the FK).
        }

        public async Task DeleteAsync(string id)
        {
            var service = await GetByIdAsync(id);
            if (service != null)
                _context.Services.Remove(service);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}