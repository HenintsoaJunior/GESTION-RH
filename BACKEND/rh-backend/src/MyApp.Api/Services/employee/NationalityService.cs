

using MyApp.Api.Entities.employee;
using MyApp.Api.Repositories.employee;

namespace MyApp.Api.Services.employee
{
    public interface INationalityService
    {
        Task<IEnumerable<Nationality>> GetAllAsync();
        Task<Nationality?> GetByIdAsync(string id);
        Task AddAsync(Nationality nationality);
        Task UpdateAsync(Nationality nationality);
        Task DeleteAsync(string id);
    }

    public class NationalityService : INationalityService
    {
        private readonly INationalityRepository _repository;

        public NationalityService(INationalityRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Nationality>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Nationality?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(Nationality nationality)
        {
            await _repository.AddAsync(nationality);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(Nationality nationality)
        {
            await _repository.UpdateAsync(nationality);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
