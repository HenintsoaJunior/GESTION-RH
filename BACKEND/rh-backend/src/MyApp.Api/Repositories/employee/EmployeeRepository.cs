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
        Task<IEnumerable<Employee>> GetAllEmployeeSimpleAsync();
        Task<IEnumerable<Employee>?> GetByMatriculeSimpleAsync(string[] matricules);
        Task<Employee?> GetByMatricule(string matricule);
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

            if (!string.IsNullOrWhiteSpace(filters.JobTitle))
            {
                query = query.Where(e => e.JobTitle != null && e.JobTitle.Contains(filters.JobTitle));
            }

            if (!string.IsNullOrWhiteSpace(filters.LastName))
            {
                query = query.Where(e => e.LastName.Contains(filters.LastName));
            }

            if (!string.IsNullOrWhiteSpace(filters.FirstName))
            {
                query = query.Where(e => e.FirstName!.Contains(filters.FirstName));
            }

            if (!string.IsNullOrWhiteSpace(filters.DirectionId))
            {
                query = query.Where(e => e.DirectionId == filters.DirectionId);
            }

            if (!string.IsNullOrWhiteSpace(filters.ContractTypeId))
            {
                query = query.Where(e => e.ContractTypeId == filters.ContractTypeId);
            }

            if (!string.IsNullOrWhiteSpace(filters.EmployeeCode))
            {
                query = query.Where(e => e.EmployeeCode != null && e.EmployeeCode.Contains(filters.EmployeeCode));
            }
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
            // Optimisation pour GetAll : Charger sans Includes si non nécessaires, ou les garder si requis pour fluidité
            // Ici, on garde les Includes car ils sont probablement utilisés, mais en cache on stocke tout
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


        public async Task<IEnumerable<Employee>> GetAllEmployeeSimpleAsync()
        {
            return await _context.Employees
                .ToListAsync();
        }

        public async Task<IEnumerable<Employee>?> GetByMatriculeSimpleAsync(string[] matricules)
        {
            if (matricules == null || matricules.Length == 0)
                return Enumerable.Empty<Employee>();

            return await _context.Employees
            .Include(e => e.Unit)
                .Include(e => e.Service)
                .Include(e => e.Department)
                .Include(e => e.Direction)
                .Include(e => e.ContractType)
                .Include(e => e.Gender)
                .Include(e => e.Site)
                .Where(e => matricules.Contains(e.EmployeeCode))
                .ToListAsync();
        }


        public async Task<Employee?> GetByMatricule(string matricule) {
            matricule = matricule.ToLower();
            return await _context.Employees
                .Include(e => e.Unit)
                .Include(e => e.Service)
                .Include(e => e.Department)
                .Include(e => e.Direction)
                .Include(e => e.ContractType)
                .Include(e => e.Gender)
                .Include(e => e.Site)
                .FirstOrDefaultAsync(e => matricule.Equals((e.EmployeeCode??"").ToLower()));
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
                .Include(e => e.Unit)
                .Include(e => e.Service)
                .Include(e => e.Department)
                .Include(e => e.Direction)
                .Include(e => e.ContractType)
                .Include(e => e.Gender)
                .Include(e => e.Site)
                .ToListAsync(); // Ajout des Includes pour cohérence et éviter N+1 si utilisé avec relations
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