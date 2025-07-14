using MyApp.Api.Entities.direction;
using MyApp.Api.Repositories.direction;

namespace MyApp.Api.Services.direction
{
    public interface IServiceService
    {
        Task<IEnumerable<Service>> GetAllAsync();
        Task<Service?> GetByIdAsync(string id);
        Task AddAsync(Service service);
        Task UpdateAsync(Service service);
        Task DeleteAsync(string id);
    }

    public class ServiceService : IServiceService
    {
        private readonly IServiceRepository _repository;

        public ServiceService(IServiceRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Service>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Service?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(Service service)
        {
            await _repository.AddAsync(service);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(Service service)
        {
            await _repository.UpdateAsync(service);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
