using MyApp.Api.Entities.employee;
using MyApp.Api.Repositories.employee;

namespace MyApp.Api.Services.employe
{
    public interface IEmployeeService
    {
        Task<IEnumerable<Employee>> GetAllAsync();
        Task<Employee?> GetByIdAsync(string id);
        Task<IEnumerable<Employee>> GetByGenderAsync(string genderId);
        Task<IEnumerable<Employee>> GetByStatusAsync(string status);
        Task AddAsync(Employee employee);
        Task UpdateAsync(Employee employee);
        Task DeleteAsync(string id);
    }

    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _repository;

        public EmployeeService(IEmployeeRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Employee>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<Employee?> GetByIdAsync(string id) => await _repository.GetByIdAsync(id);

        public async Task<IEnumerable<Employee>> GetByGenderAsync(string genderId) => await _repository.GetByGenderAsync(genderId);

        public async Task<IEnumerable<Employee>> GetByStatusAsync(string status) => await _repository.GetByStatusAsync(status);

        public async Task AddAsync(Employee employee)
        {
            await _repository.AddAsync(employee);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(Employee employee)
        {
            await _repository.UpdateAsync(employee);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
