using MyApp.Api.Entities.direction;
using MyApp.Api.Repositories.direction;

namespace MyApp.Api.Services.direction
{
    public interface IDirectionService
    {
        Task<IEnumerable<Direction>> GetAllAsync();
        Task<Direction?> GetByIdAsync(string id);
        Task AddAsync(Direction direction);
        Task UpdateAsync(Direction direction);
        Task DeleteAsync(string id);
    }

    public class DirectionService : IDirectionService
    {
        private readonly IDirectionRepository _repository;

        public DirectionService(IDirectionRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Direction>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Direction?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(Direction direction)
        {
            await _repository.AddAsync(direction);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(Direction direction)
        {
            await _repository.UpdateAsync(direction);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
