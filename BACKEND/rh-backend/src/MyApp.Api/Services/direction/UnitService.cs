
using MyApp.Api.Entities.direction;
using MyApp.Api.Repositories.direction;

namespace MyApp.Api.Services.direction
{
    public interface IUnitService
    {
        Task<IEnumerable<Unit>> GetAllAsync();
        Task<Unit?> GetByIdAsync(string id);
        Task AddAsync(Unit unit);
        Task UpdateAsync(Unit unit);
        Task DeleteAsync(string id);
    }

    public class UnitService : IUnitService
    {
        private readonly IUnitRepository _repository;

        public UnitService(IUnitRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Unit>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Unit?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(Unit unit)
        {
            await _repository.AddAsync(unit);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(Unit unit)
        {
            await _repository.UpdateAsync(unit);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
