using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using System.Linq;
using System.Threading.Tasks;

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
        Task<(IEnumerable<MissionAssignation>? Items, int TotalCount)> GetDistinctMissionAssignationsAsync(string? status, int pageNumber, int pageSize);
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
                .AsNoTracking()
                .Where(er => er.AssignationId == assignationId)
                .Include(er => er.ExpenseReportType)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExpenseReport>> search()
        {
            return await _context.ExpenseReports
                .AsNoTracking()
                .Include(er => er.MissionAssignation)
                .Include(er => er.ExpenseReportType)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExpenseReport>> GetAllAsync()
        {
            return await _context.ExpenseReports
                .AsNoTracking()
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

        public async Task<(IEnumerable<MissionAssignation>? Items, int TotalCount)> GetDistinctMissionAssignationsAsync(string? status, int pageNumber, int pageSize)
        {
            var query = _context.ExpenseReports
                .AsNoTracking()
                .Include(er => er.MissionAssignation)
                .ThenInclude(ma => ma!.Employee)
                .Where(er => er.MissionAssignation != null);

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(er => er.Status == status);
            }

            // Get distinct MissionAssignation IDs
            var assignationIdsQuery = query
                .Select(er => er.AssignationId)
                .Distinct();

            var totalCount = await assignationIdsQuery.CountAsync();

            if (totalCount == 0)
            {
                return (null, 0);
            }

            // Get MissionAssignations for the distinct IDs with pagination
            var result = await assignationIdsQuery
                .OrderBy(id => id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Join(_context.MissionAssignations.Include(ma => ma.Employee),
                      assignationId => assignationId,
                      missionAssignation => missionAssignation.AssignationId,
                      (assignationId, missionAssignation) => missionAssignation)
                .ToListAsync();

            return (result, totalCount);
        }
    }
}