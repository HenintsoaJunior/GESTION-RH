using MyApp.Api.Entities.employee;
using MyApp.Api.Repositories.employee;

namespace MyApp.Api.Services.employe
{
    public interface IEmployeeCategoryService
    {
        Task<IEnumerable<EmployeeCategory>> GetAllAsync();
        Task<EmployeeCategory?> GetByIdAsync(string id);
        Task AddAsync(EmployeeCategory category);
        Task UpdateAsync(EmployeeCategory category);
        Task DeleteAsync(string id);
    }

    public class EmployeeCategoryService : IEmployeeCategoryService
    {
        private readonly IEmployeeCategoryRepository _repository;

        public EmployeeCategoryService(IEmployeeCategoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<EmployeeCategory>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<EmployeeCategory?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(EmployeeCategory category)
        {
            await _repository.AddAsync(category);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(EmployeeCategory category)
        {
            await _repository.UpdateAsync(category);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
