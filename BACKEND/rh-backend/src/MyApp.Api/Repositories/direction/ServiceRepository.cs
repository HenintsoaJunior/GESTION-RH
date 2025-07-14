using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.direction;

namespace MyApp.Api.Repositories.direction
{
    public interface IServiceRepository
    {
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

        public Task UpdateAsync(Service service)
        {
            service.UpdatedAt = DateTime.Now;
            _context.Services.Update(service);
            return Task.CompletedTask;
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
