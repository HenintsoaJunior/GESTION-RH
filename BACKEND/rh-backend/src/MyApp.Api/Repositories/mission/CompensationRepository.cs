using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface ICompensationRepository
    {
        Task<IEnumerable<Compensation>> GetAllAsync();
        Task<IEnumerable<Compensation>> GetByEmployeeIdAsync(string employeeId);
        Task<IEnumerable<Compensation>> GetByMissionIdAsync(string missionId);
        Task<Compensation?> GetByIdAsync(string compensationId);
        Task<List<Compensation>> GetByEmployeeAndMissionIdAsync(string employeeId, string missionId);
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
                .Include(c => c.Employee)
                .OrderByDescending(c => c.PaymentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Compensation>> GetByEmployeeIdAsync(string employeeId)
        {
            return await _context.Compensations
                .Where(c => c.EmployeeId == employeeId)
                .Include(c => c.Employee)
                .OrderByDescending(c => c.PaymentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Compensation>> GetByMissionIdAsync(string missionId)
        {
            return await _context.Compensations
                .Where(c => c.MissionId == missionId)
                .OrderByDescending(c => c.PaymentDate)
                .ToListAsync();
        }

        public async Task<Compensation?> GetByIdAsync(string compensationId)
        {
            return await _context.Compensations
                .Include(c => c.Employee)
                .FirstOrDefaultAsync(c => c.CompensationId == compensationId);
        }

        public async Task<List<Compensation>> GetByEmployeeAndMissionIdAsync(string employeeId, string missionId)
        {
            return await _context.Compensations
                .AsNoTracking()
                .Include(c => c.Employee)
                .Where(c => c.EmployeeId == employeeId && c.MissionId == missionId)
                .OrderByDescending(c => c.PaymentDate)
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
                .Where(c => c.Status == "unpaid")
                .SumAsync(c => c.TransportAmount + c.BreakfastAmount + c.LunchAmount + c.DinnerAmount + c.AccommodationAmount);
        }

        public async Task AddAsync(Compensation compensation)
        {
            await _context.Compensations.AddAsync(compensation);
        }

        public Task UpdateAsync(Compensation compensation)
        {
            var existingCompensation = _context.Compensations.Local
                .FirstOrDefault(c => c.CompensationId == compensation.CompensationId);
            
            if (existingCompensation != null)
            {
                // Détacher l'entité existante pour éviter les conflits
                _context.Entry(existingCompensation).State = EntityState.Detached;
            }
            
            // Attacher et marquer comme modifié
            _context.Compensations.Attach(compensation);
            _context.Entry(compensation).State = EntityState.Modified;
            
            // Empêcher le tracking des entités liées (Employee, Mission, etc.)
            if (compensation.Employee != null)
            {
                _context.Entry(compensation.Employee).State = EntityState.Unchanged;
            }
            
            if (compensation.Mission != null)
            {
                _context.Entry(compensation.Mission).State = EntityState.Unchanged;
            }
            
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}