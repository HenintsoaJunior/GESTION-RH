using MyApp.Api.Entities.employee;
using MyApp.Api.Repositories.employee;

namespace MyApp.Api.Services.employee
{
    public interface IMaritalStatusService
    {
        Task<IEnumerable<MaritalStatus>> GetAllAsync();
        Task<MaritalStatus?> GetByIdAsync(string id);
        Task AddAsync(MaritalStatus status);
        Task UpdateAsync(MaritalStatus status);
        Task DeleteAsync(string id);
    }

    public class MaritalStatusService : IMaritalStatusService
    {
        private readonly IMaritalStatusRepository _repository;

        public MaritalStatusService(IMaritalStatusRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<MaritalStatus>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<MaritalStatus?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(MaritalStatus status)
        {
            await _repository.AddAsync(status);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(MaritalStatus status)
        {
            await _repository.UpdateAsync(status);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
