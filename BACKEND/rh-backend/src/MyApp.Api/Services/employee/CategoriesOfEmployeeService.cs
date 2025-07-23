using MyApp.Api.Entities.employee;
using MyApp.Api.Repositories.employee;

namespace MyApp.Api.Services.employee
{
    public interface ICategoriesOfEmployeeService
    {
        Task<IEnumerable<CategoriesOfEmployee>> GetCategoriesByEmployeeIdAsync(string employeeId, DateTime date);
        Task AddAsync(CategoriesOfEmployee entity);
        Task UpdateAsync(CategoriesOfEmployee entity);
        Task DeleteAsync(CategoriesOfEmployee entity);
    }

    public class CategoriesOfEmployeeService : ICategoriesOfEmployeeService
    {
        private readonly ICategoriesOfEmployeeRepository _repository;

        public CategoriesOfEmployeeService(ICategoriesOfEmployeeRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<CategoriesOfEmployee>> GetCategoriesByEmployeeIdAsync(string employeeId, DateTime date)
        {
            return await _repository.GetByEmployeeIdBeforeDateAsync(employeeId, date);
        }

        public async Task AddAsync(CategoriesOfEmployee entity)
        {
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(CategoriesOfEmployee entity)
        {
            _repository.Update(entity);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(CategoriesOfEmployee entity)
        {
            _repository.Delete(entity);
            await _repository.SaveChangesAsync();
        }
    }
}
