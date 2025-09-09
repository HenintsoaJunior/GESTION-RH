using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IExpenseReportRepository
    {
        Task<IEnumerable<ExpenseReport>> GetByAssignationIdAsync(string assignationId);
        Task<IEnumerable<ExpenseReport>> GetAllAsync();
        Task<ExpenseReport?> GetByIdAsync(string id);
        Task AddAsync(ExpenseReport entity);
        Task UpdateAsync(ExpenseReport entity);
        Task DeleteAsync(ExpenseReport entity);
        Task SaveChangesAsync();
    }

    public class ExpenseReportRepository : IExpenseReportRepository
    {
        private readonly AppDbContext _context;

        public ExpenseReportRepository(AppDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<ExpenseReport>> GetByAssignationIdAsync(string assignationId)
        {
            return await _context.ExpenseReports
                .Where(er => er.AssignationId == assignationId)
                .Include(er => er.ExpenseReportType)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExpenseReport>> GetAllAsync()
        {
            return await _context.ExpenseReports
                .Include(er => er.MissionAssignation)
                .Include(er => er.ExpenseReportType)
                .ToListAsync();
        }

        public async Task<ExpenseReport?> GetByIdAsync(string id)
        {
            return await _context.ExpenseReports
                .AsNoTracking()
                .Include(er => er.MissionAssignation)
                .Include(er => er.ExpenseReportType)
                .FirstOrDefaultAsync(er => er.ExpenseReportId == id);
        }

        public async Task AddAsync(ExpenseReport entity)
        {
            await _context.ExpenseReports.AddAsync(entity);
        }

        public Task UpdateAsync(ExpenseReport entity)
        {
            _context.ExpenseReports.Update(entity);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(ExpenseReport entity)
        {
            _context.ExpenseReports.Remove(entity);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}