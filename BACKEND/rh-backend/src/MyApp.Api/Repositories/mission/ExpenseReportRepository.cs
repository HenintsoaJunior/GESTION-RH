using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.record;

namespace MyApp.Api.Repositories.mission
{
    public interface IExpenseReportRepository
    {
        Task<IEnumerable<ExpenseReport>> GetByMissionIdAsync(string missionId);
        Task<IEnumerable<ExpenseReport>> GetAllAsync();
        Task<IEnumerable<ExpenseReport>> GetNotReimbursedAsync();
        Task<ExpenseReport?> GetByIdAsync(string id);
        Task AddAsync(ExpenseReport entity);
        Task UpdateAsync(ExpenseReport entity);
        Task DeleteAsync(ExpenseReport entity);
        Task SaveChangesAsync();
        Task<(IEnumerable<Mission> Items, int TotalCount)> GetDistinctMissionsWithExpensesAsync(string? status, int page, int pageSize);
        Task<(IEnumerable<ExpenseSummary>, int TotalCount)> GetByStatusAsync(string? status, int page, int pageSize);
    }

    public class ExpenseReportRepository : IExpenseReportRepository
    {
        private readonly AppDbContext _context;

        public ExpenseReportRepository(AppDbContext context) => _context = context;

        public async Task<IEnumerable<ExpenseReport>> GetByMissionIdAsync(string missionId)
        {
            return await _context.ExpenseReports
                .AsNoTracking()
                .Where(er => er.MissionId == missionId)
                .Include(er => er.ExpenseReportType)
                .Include(er => er.Mission!)
                    .ThenInclude(m => m.Lieu)
                .Include(er => er.Mission!)
                    .ThenInclude(m => m.Employee)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExpenseReport>> GetAllAsync()
        {
            return await _context.ExpenseReports
                .AsNoTracking()
                .Include(er => er.Mission!)
                    .ThenInclude(m => m.Lieu)
                .Include(er => er.Mission!)
                    .ThenInclude(m => m.Employee)
                .Include(er => er.ExpenseReportType)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExpenseReport>> GetNotReimbursedAsync()
        {
            return await _context.ExpenseReports
                .AsNoTracking()
                .Where(er => er.Status == "notreimbursed")
                .Include(er => er.Mission!)
                    .ThenInclude(m => m.Lieu)
                .Include(er => er.Mission!)
                    .ThenInclude(m => m.Employee)
                .Include(er => er.ExpenseReportType)
                .ToListAsync();
        }

        public async Task<ExpenseReport?> GetByIdAsync(string id)
        {
            return await _context.ExpenseReports
                .AsNoTracking()
                .Include(er => er.Mission!)
                    .ThenInclude(m => m.Lieu)
                .Include(er => er.Mission!)
                    .ThenInclude(m => m.Employee)
                .Include(er => er.ExpenseReportType)
                .FirstOrDefaultAsync(er => er.ExpenseReportId == id);
        }

        public async Task AddAsync(ExpenseReport entity) => await _context.ExpenseReports.AddAsync(entity);
        public Task UpdateAsync(ExpenseReport entity) { _context.ExpenseReports.Update(entity); return Task.CompletedTask; }
        public Task DeleteAsync(ExpenseReport entity)
        {
            if (entity.ExpenseReportType != null) entity.ExpenseReportType = null;
            _context.ExpenseReports.Remove(entity);
            return Task.CompletedTask;
        }
        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();

        public async Task<(IEnumerable<Mission> Items, int TotalCount)> GetDistinctMissionsWithExpensesAsync(
            string? status, int page, int pageSize)
        {
            var query = _context.ExpenseReports.AsNoTracking().Where(er => er.MissionId != null);
            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(er => er.Status == status);

            var missions = query
                .Select(er => er.Mission!)
                .Distinct()
                .Include(m => m.Employee)
                .Include(m => m.Lieu);

            var total = await missions.CountAsync();

            var items = await missions
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, total);
        }

        public async Task<(IEnumerable<ExpenseSummary>, int TotalCount)> GetByStatusAsync(
            string? status, int page, int pageSize)
        {
            var query = _context.ExpenseReports
                .AsNoTracking()
                .Where(er => er.MissionId != null &&
                            (string.IsNullOrWhiteSpace(status) || er.Status == status));

            var grouped = query
                .GroupBy(er => er.MissionId)
                .Select(g => new
                {
                    MissionId = g.Key!,
                    TotalAmount = g.Sum(x => x.Amount),
                    CreatedAt = g.Min(x => x.CreatedAt),
                    LatestStatus = g.OrderByDescending(x => x.CreatedAt).Select(x => x.Status!).First()
                });

            var totalCount = await grouped.CountAsync();

            var result = await grouped
                .OrderByDescending(g => g.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Join(
                    _context.Missions
                        .Include(m => m.Employee)
                        .Include(m => m.Lieu), // On charge Lieu
                    g => g.MissionId,
                    m => m.MissionId,
                    (g, m) => new
                    {
                        g.MissionId,
                        MissionName = m.Name ?? "Sans titre",
                        g.LatestStatus,
                        EmployeeLastName = m.Employee != null ? m.Employee.LastName : null,
                        EmployeeFirstName = m.Employee != null ? m.Employee.FirstName : null,
                        m.EmployeeId,
                        EmployeeCode = m.Employee != null ? m.Employee.EmployeeCode : null,
                        LieuNom = m.Lieu != null ? m.Lieu.Nom : null,
                        g.CreatedAt,
                        g.TotalAmount
                    })
                .Select(x => new ExpenseSummary(
                    x.MissionId,
                    x.MissionName,
                    x.LatestStatus,
                    string.Join(" ", 
                        new[] { x.EmployeeLastName, x.EmployeeFirstName }
                            .Where(n => !string.IsNullOrWhiteSpace(n))
                    ).Trim(),
                    x.EmployeeId ?? "",
                    x.EmployeeCode ?? "",
                    x.LieuNom ?? "Non spécifié",
                    x.CreatedAt,
                    x.TotalAmount
                ))
                .ToListAsync();

            return (result, totalCount);
        }
    }
}