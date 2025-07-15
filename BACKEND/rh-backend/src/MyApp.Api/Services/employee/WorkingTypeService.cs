using MyApp.Api.Entities.employee;
using MyApp.Api.Repositories.employee;

namespace MyApp.Api.Services.employe
{
    public interface IWorkingTimeTypeService
    {
        Task<IEnumerable<WorkingTimeType>> GetAllAsync();
        Task<WorkingTimeType?> GetByIdAsync(string id);
        Task AddAsync(WorkingTimeType type);
        Task UpdateAsync(WorkingTimeType type);
        Task DeleteAsync(string id);
    }

    public class WorkingTimeTypeService : IWorkingTimeTypeService
    {
        private readonly IWorkingTimeTypeRepository _repository;

        public WorkingTimeTypeService(IWorkingTimeTypeRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<WorkingTimeType>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<WorkingTimeType?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(WorkingTimeType type)
        {
            await _repository.AddAsync(type);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(WorkingTimeType type)
        {
            await _repository.UpdateAsync(type);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
