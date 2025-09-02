using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.employee;

namespace MyApp.Api.Repositories.employee
{
    public interface IEmployeeRepository
    {
        void Detach(Employee employee);
        Task<(IEnumerable<Employee>, int)> SearchAsync(EmployeeSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Employee>> GetAllAsync();
        Task<Employee?> GetByIdAsync(string id);
        Task<IEnumerable<Employee>> GetByGenderAsync(string genderId);
        Task AddAsync(Employee employee);
        Task UpdateAsync(Employee employee);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
        Task<EmployeeStats> GetStatisticsAsync();
    }

    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly AppDbContext _context;

        public EmployeeRepository(AppDbContext context)
        {
            _context = context;
        }

        public void Detach(Employee employee)
        {
            _context.Entry(employee).State = EntityState.Detached;
        }

        public async Task<(IEnumerable<Employee>, int)> SearchAsync(EmployeeSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.Employees
                .Include(e => e.Unit)
                .Include(e => e.Service)
                .Include(e => e.Department)
                .Include(e => e.Direction)
                .Include(e => e.ContractType)
                .Include(e => e.Gender)
                .Include(e => e.Site)
                .AsQueryable();

            // Filtre par titre (JobTitle)
            if (!string.IsNullOrWhiteSpace(filters.JobTitle))
            {
                query = query.Where(e => e.JobTitle != null && e.JobTitle.Contains(filters.JobTitle));
            }

            // Filtre par nom (LastName)
            if (!string.IsNullOrWhiteSpace(filters.LastName))
            {
                query = query.Where(e => e.LastName.Contains(filters.LastName));
            }

            // Filtre par prénom (FirstName)
            if (!string.IsNullOrWhiteSpace(filters.FirstName))
            {
                query = query.Where(e => e.FirstName.Contains(filters.FirstName));
            }

            // Filtre par direction (DirectionId)
            if (!string.IsNullOrWhiteSpace(filters.DirectionId))
            {
                query = query.Where(e => e.DirectionId == filters.DirectionId);
            }

            // Filtre par type de contrat (ContractTypeId)
            if (!string.IsNullOrWhiteSpace(filters.ContractTypeId))
            {
                query = query.Where(e => e.ContractTypeId == filters.ContractTypeId);
            }

            // Filtre par code employé (EmployeeCode)
            if (!string.IsNullOrWhiteSpace(filters.EmployeeCode))
            {
                query = query.Where(e => e.EmployeeCode != null && e.EmployeeCode.Contains(filters.EmployeeCode));
            }

            // Filtre par site (SiteId)
            if (!string.IsNullOrWhiteSpace(filters.SiteId))
            {
                query = query.Where(e => e.SiteId == filters.SiteId);
            }

            // Filtre par genre (GenderId)
            if (!string.IsNullOrWhiteSpace(filters.GenderId))
            {
                query = query.Where(e => e.GenderId == filters.GenderId);
            }

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderBy(e => e.LastName)
                .ThenBy(e => e.FirstName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            return await _context.Employees
                .Include(e => e.Unit)
                .Include(e => e.Service)
                .Include(e => e.Department)
                .Include(e => e.Direction)
                .Include(e => e.ContractType)
                .Include(e => e.Gender)
                .Include(e => e.Site)
                .ToListAsync();
        }

        public async Task<Employee?> GetByIdAsync(string id)
        {
            return await _context.Employees
                .Include(e => e.Unit)
                .Include(e => e.Service)
                .Include(e => e.Department)
                .Include(e => e.Direction)
                .Include(e => e.ContractType)
                .Include(e => e.Gender)
                .Include(e => e.Site)
                .FirstOrDefaultAsync(e => e.EmployeeId == id);
        }

        public async Task<IEnumerable<Employee>> GetByGenderAsync(string genderId)
        {
            return await _context.Employees
                .Where(e => e.GenderId == genderId)
                .ToListAsync();
        }

        public async Task AddAsync(Employee employee)
        {
            await _context.Employees.AddAsync(employee);
        }

        public Task UpdateAsync(Employee employee)
        {
            _context.Employees.Update(employee);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var employee = await GetByIdAsync(id);
            if (employee != null)
                _context.Employees.Remove(employee);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<EmployeeStats> GetStatisticsAsync()
        {
            var total = await _context.Employees.CountAsync();

            return new EmployeeStats
            {
                Total = total
            };
        }
    }
}