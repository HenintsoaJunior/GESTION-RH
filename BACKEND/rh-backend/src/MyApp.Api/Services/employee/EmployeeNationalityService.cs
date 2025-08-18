using MyApp.Api.Entities.employee;
using MyApp.Api.Repositories.employee;

namespace MyApp.Api.Services.employee
{
    public interface IEmployeeNationalityService
    {
        Task<IEnumerable<EmployeeNationality>> GetByEmployeeIdAsync(string employeeId);
        Task<IEnumerable<EmployeeNationality>> GetByNationalityIdAsync(string nationalityId);
        Task AddAsync(EmployeeNationality entity);
        Task RemoveAsync(EmployeeNationality entity);
    }

    public class EmployeeNationalityService : IEmployeeNationalityService
    {
        private readonly IEmployeeNationalityRepository _repository;

        public EmployeeNationalityService(IEmployeeNationalityRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<EmployeeNationality>> GetByEmployeeIdAsync(string employeeId)
        {
            return await _repository.GetByEmployeeIdAsync(employeeId);
        }

        public async Task<IEnumerable<EmployeeNationality>> GetByNationalityIdAsync(string nationalityId)
        {
            return await _repository.GetByNationalityIdAsync(nationalityId);
        }

        public async Task AddAsync(EmployeeNationality entity)
        {
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
        }

        public async Task RemoveAsync(EmployeeNationality entity)
        {
            await _repository.RemoveAsync(entity);
            await _repository.SaveChangesAsync();
        }
    }
}
