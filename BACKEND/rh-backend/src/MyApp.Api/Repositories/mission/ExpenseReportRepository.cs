using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.record;
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
        Task<(IEnumerable<ExpenseSummary>, int TotalCount)> GetByStatusAsync(string? status, int pageNumber, int pageSize);
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

        public async Task DeleteAsync(ExpenseReport entity)
        {
            if (entity.ExpenseReportType != null)
            {
                entity.ExpenseReportType = null;
            }

            _context.ExpenseReports.Remove(entity);
            await Task.CompletedTask; 
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

            var assignationIdsQuery = query
                .Select(er => er.AssignationId)
                .Distinct();

            var totalCount = await assignationIdsQuery.CountAsync();

            if (totalCount == 0)
            {
                return (null, 0);
            }

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

        public async Task<(IEnumerable<ExpenseSummary>, int TotalCount)> GetByStatusAsync(string? status, int pageNumber, int pageSize)
        {
            var baseQuery = _context.ExpenseReports
                .AsNoTracking()
                .Where(er => er.MissionAssignation != null && (string.IsNullOrEmpty(status) || er.Status == status));

            var summaryGroups = baseQuery
                .GroupBy(er => er.AssignationId)
                .Select(g => new
                {
                    AssignationId = g.Key,
                    TotalAmount = g.Sum(x => x.AmountMGA),
                    CreatedAt = g.Min(x => x.CreatedAt)
                });

            var maxDatesSubquery = baseQuery
                .GroupBy(er => er.AssignationId)
                .Select(g => new
                {
                    AssignationId = g.Key,
                    MaxCreatedAt = g.Max(x => x.CreatedAt)
                });

            var latestJoined = baseQuery
                .Join(maxDatesSubquery,
                    er => new { er.AssignationId, Date = er.CreatedAt },
                    md => new { AssignationId = md.AssignationId, Date = md.MaxCreatedAt },
                    (er, md) => new { er.AssignationId, er.Status });

            var latestStatusQuery = latestJoined
                .GroupBy(x => x.AssignationId)
                .Select(g => new
                {
                    AssignationId = g.Key,
                    Status = g.First().Status
                });

            var expenseGroups = summaryGroups
                .Join(latestStatusQuery,
                    s => s.AssignationId,
                    ls => ls.AssignationId,
                    (s, ls) => new
                    {
                        AssignationId = s.AssignationId,
                        TotalAmount = s.TotalAmount,
                        CreatedAt = s.CreatedAt,
                        Status = ls.Status
                    });

            var resultQuery = from eg in expenseGroups
                              join ma in _context.MissionAssignations.AsNoTracking()
                              on eg.AssignationId equals ma.AssignationId
                              join employee in _context.Employees.AsNoTracking()
                              on ma.EmployeeId equals employee.EmployeeId
                              join mission in _context.Missions.AsNoTracking()
                              on ma.MissionId equals mission.MissionId
                              join lieu in _context.Lieux.AsNoTracking()
                              on mission.LieuId equals lieu.LieuId into lj
                              from l in lj.DefaultIfEmpty()
                              select new
                              {
                                  MissionId = mission.MissionId,
                                  AssignationId = eg.AssignationId,
                                  MissionName = mission.Name ?? "",
                                  Status = eg.Status,
                                  EmployeeName = (employee.LastName ?? "") + " " + (employee.FirstName ?? ""),
                                  EmployeeCode = employee.EmployeeCode ?? "",
                                  LieuName = l != null ? (l.Nom ?? "") : "",
                                  CreatedAt = eg.CreatedAt,
                                  TotalAmount = eg.TotalAmount
                              };

            var totalCount = await resultQuery.CountAsync();

            var orderedPaged = resultQuery
                .OrderByDescending(x => x.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize);

            var anonList = await orderedPaged.ToListAsync();

            var results = anonList.Select(a => new ExpenseSummary(
                a.MissionId,
                a.AssignationId,
                a.MissionName,
                a.Status,
                a.EmployeeName,
                a.EmployeeCode,
                a.LieuName,
                a.CreatedAt,
                a.TotalAmount
            )).ToList();

            return (results, totalCount);
        }        
    }
}