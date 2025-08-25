using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface ICompensationScaleRepository
    {
        Task<IEnumerable<CompensationScale>> GetAllAsync();
        Task<CompensationScale?> GetByIdAsync(string id);
        Task<IEnumerable<CompensationScale>> GetByEmployeeCategoryAsync(string employeeCategoryId);
        Task<IEnumerable<CompensationScale>> GetByCriteriaAsync(CompensationScaleDTOForm criteria);
        Task AddAsync(CompensationScale scale);
        Task UpdateAsync(CompensationScale scale);
        Task DeleteAsync(CompensationScale scale);
        Task SaveChangesAsync();
    }

    public class CompensationScaleRepository : ICompensationScaleRepository
    {
        private readonly AppDbContext _context;

        public CompensationScaleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CompensationScale>> GetAllAsync()
        {
            return await _context.CompensationScales
                .Include(c => c.Transport)
                .Include(c => c.ExpenseType)
                .Include(c => c.EmployeeCategory)
                .ToListAsync();
        }

        public async Task<CompensationScale?> GetByIdAsync(string id)
        {
            return await _context.CompensationScales
                .Include(c => c.Transport)
                .Include(c => c.ExpenseType)
                .Include(c => c.EmployeeCategory)
                .FirstOrDefaultAsync(c => c.CompensationScaleId == id);
        }

        public async Task<IEnumerable<CompensationScale>> GetByEmployeeCategoryAsync(string employeeCategoryId)
        {
            return await _context.CompensationScales
                .Include(c => c.Transport)
                .Include(c => c.ExpenseType)
                .Include(c => c.EmployeeCategory)
                .Where(c => c.EmployeeCategoryId == employeeCategoryId)
                .ToListAsync();
        }

        public async Task<IEnumerable<CompensationScale>> GetByCriteriaAsync(CompensationScaleDTOForm criteria)
        {
            var query = _context.CompensationScales
                .Include(c => c.Transport)
                .Include(c => c.ExpenseType)
                .Include(c => c.EmployeeCategory)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(criteria.TransportId))
                query = query.Where(c => c.TransportId == criteria.TransportId);

            if (!string.IsNullOrWhiteSpace(criteria.ExpenseTypeId))
                query = query.Where(c => c.ExpenseTypeId == criteria.ExpenseTypeId);

            if (!string.IsNullOrWhiteSpace(criteria.EmployeeCategoryId))
                query = query.Where(c => c.EmployeeCategoryId == criteria.EmployeeCategoryId);

            return await query
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(CompensationScale scale)
        {
            await _context.CompensationScales.AddAsync(scale);
        }

        public Task UpdateAsync(CompensationScale scale)
        {
            _context.CompensationScales.Update(scale);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(CompensationScale scale)
        {
            _context.CompensationScales.Remove(scale);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
