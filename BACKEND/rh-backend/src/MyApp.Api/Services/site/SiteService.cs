
using MyApp.Api.Entities.site;
using MyApp.Api.Repositories.site;

namespace MyApp.Api.Services.site
{
    public interface ISiteService
    {
        Task<IEnumerable<Site>> GetAllAsync();
        Task<Site?> GetByIdAsync(string id);
        Task AddAsync(Site site);
        Task UpdateAsync(Site site);
        Task DeleteAsync(string id);
    }

    public class SiteService : ISiteService
    {
        private readonly ISiteRepository _repository;

        public SiteService(ISiteRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Site>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Site?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(Site site)
        {
            await _repository.AddAsync(site);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(Site site)
        {
            await _repository.UpdateAsync(site);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
