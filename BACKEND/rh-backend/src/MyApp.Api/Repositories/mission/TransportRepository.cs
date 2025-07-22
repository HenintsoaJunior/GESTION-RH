using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface ITransportRepository
    {
        Task<IEnumerable<Transport>> GetAllAsync();
        Task<Transport?> GetByIdAsync(string id);
        Task AddAsync(Transport transport);
        Task UpdateAsync(Transport transport);
        Task DeleteAsync(Transport transport);
        Task SaveChangesAsync();
    }
    
    public class TransportRepository : ITransportRepository
    {
        private readonly AppDbContext _context;

        public TransportRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Transport>> GetAllAsync()
        {
            return await _context.Transports
                .OrderBy(t => t.Type)
                .ToListAsync();
        }

        public async Task<Transport?> GetByIdAsync(string id)
        {
            return await _context.Transports.FindAsync(id);
        }

        public async Task AddAsync(Transport transport)
        {
            await _context.Transports.AddAsync(transport);
        }

        public Task UpdateAsync(Transport transport)
        {
            _context.Transports.Update(transport);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Transport transport)
        {
            _context.Transports.Remove(transport);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
