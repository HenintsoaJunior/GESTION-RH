using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.site;

namespace MyApp.Api.Repositories.site
{
    public interface ISiteRepository
    {
        Task<IEnumerable<Site>> GetAllAsync();
        Task<Site?> GetByIdAsync(string id);
        Task AddAsync(Site site);
        Task UpdateAsync(Site site);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class SiteRepository : ISiteRepository
    {
        private readonly AppDbContext _context;

        public SiteRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Site>> GetAllAsync()
        {
            return await _context.Sites
                .OrderBy(s => s.SiteName)
                .ToListAsync();
        }

        public async Task<Site?> GetByIdAsync(string id)
        {
            return await _context.Sites.FirstOrDefaultAsync(s => s.SiteId == id);
        }

        public async Task AddAsync(Site site)
        {
            site.CreatedAt = DateTime.Now;
            await _context.Sites.AddAsync(site);
        }

        public Task UpdateAsync(Site site)
        {
            site.UpdatedAt = DateTime.Now;
            _context.Sites.Update(site);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var site = await GetByIdAsync(id);
            if (site != null)
                _context.Sites.Remove(site);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
