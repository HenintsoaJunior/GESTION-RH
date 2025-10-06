using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface ICompensationRepository
    {
        Task<IEnumerable<Compensation>> GetAllAsync();
        Task<IEnumerable<Compensation>> GetByEmployeeIdAsync(string employeeId);
        Task<IEnumerable<Compensation>> GetByAssignationIdAsync(string assignationId);
        Task<Compensation?> GetByIdAsync(string compensationId);
        Task<List<Compensation>> GetByEmployeeAndAssignationIdAsync(string employeeId, string assignationId);
        Task<decimal> GetTotalPaidAmountAsync();
        Task<decimal> GetTotalNotPaidAmountAsync();
        Task AddAsync(Compensation compensation);
        Task UpdateAsync(Compensation compensation);
        Task SaveChangesAsync();
    }

    public class CompensationRepository : ICompensationRepository
    {
        private readonly AppDbContext _context;

        public CompensationRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<IEnumerable<Compensation>> GetAllAsync()
        {
            return await _context.Compensations
                .Include(c => c.Assignation)
                .Include(c => c.Employee)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Compensation>> GetByEmployeeIdAsync(string employeeId)
        {
            return await _context.Compensations
                .Where(c => c.EmployeeId == employeeId)
                .Include(c => c.Assignation)
                .Include(c => c.Employee)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Compensation>> GetByAssignationIdAsync(string assignationId)
        {
            return await _context.Compensations
                .Where(c => c.AssignationId == assignationId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Compensation?> GetByIdAsync(string compensationId)
        {
            return await _context.Compensations
                .Include(c => c.Assignation)
                .Include(c => c.Employee)
                .FirstOrDefaultAsync(c => c.CompensationId == compensationId);
        }

        public async Task<List<Compensation>> GetByEmployeeAndAssignationIdAsync(string employeeId, string assignationId)
        {
            return await _context.Compensations
                .Include(c => c.Assignation)
                .Include(c => c.Employee)
                .Where(c => c.EmployeeId == employeeId && c.AssignationId == assignationId)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalPaidAmountAsync()
        {
            return await _context.Compensations
                .Where(c => c.Status == "paid")
                .SumAsync(c => c.TransportAmount + c.BreakfastAmount + c.LunchAmount + c.DinnerAmount + c.AccommodationAmount);
        }

        public async Task<decimal> GetTotalNotPaidAmountAsync()
        {
            return await _context.Compensations
                .Where(c => c.Status == "not paid")
                .SumAsync(c => c.TransportAmount + c.BreakfastAmount + c.LunchAmount + c.DinnerAmount + c.AccommodationAmount);
        }

        

        public async Task AddAsync(Compensation compensation)
        {
            await _context.Compensations.AddAsync(compensation);
        }

        public Task UpdateAsync(Compensation compensation)
        {
            var existingCompensation = _context.Compensations.Local.FirstOrDefault(c => c.CompensationId == compensation.CompensationId);
            if (existingCompensation != null)
            {
                _context.Entry(existingCompensation).CurrentValues.SetValues(compensation);
            }
            else
            {
                _context.Compensations.Update(compensation);
            }

            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}