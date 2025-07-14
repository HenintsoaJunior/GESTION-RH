using MyApp.Api.Entities.employee;
using MyApp.Api.Repositories.employee;

namespace MyApp.Api.Services.employee
{
    public interface IGenderService
    {
        Task<IEnumerable<Gender>> GetAllAsync();
        Task<Gender?> GetByIdAsync(string id);
        Task AddAsync(Gender gender);
        Task UpdateAsync(Gender gender);
        Task DeleteAsync(string id);
    }

    public class GenderService : IGenderService
    {
        private readonly IGenderRepository _repository;

        public GenderService(IGenderRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Gender>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Gender?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(Gender gender)
        {
            await _repository.AddAsync(gender);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(Gender gender)
        {
            await _repository.UpdateAsync(gender);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
