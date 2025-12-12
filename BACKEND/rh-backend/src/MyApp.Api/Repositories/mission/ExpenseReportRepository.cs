using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.enums;
using MyApp.Api.Models.dto.mission;
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
        Task<(IEnumerable<ExpenseSummary>, int TotalCount)> GetByFilterAsync(ExpenseReportFilterDto filterDto, int page, int pageSize);
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

        public async Task<(IEnumerable<ExpenseSummary>, int TotalCount)> GetByFilterAsync(
            ExpenseReportFilterDto filterDto, int page, int pageSize)
        {
            var query = from er in _context.ExpenseReports
                        join m in _context.Missions on er.MissionId equals m.MissionId
                        join emp in _context.Employees on m.EmployeeId equals emp.EmployeeId into empJoin
                        from emp in empJoin.DefaultIfEmpty()
                        join l in _context.Lieux on m.LieuId equals l.LieuId into lJoin
                        from l in lJoin.DefaultIfEmpty()
                        where er.MissionId != null
                        select new
                        {
                            er.MissionId,
                            er.Amount,
                            er.Status,
                            er.CreatedAt,
                            er.UpdatedAt,
                            m.Name,
                            m.MissionType,
                            PaymentType = m.Type,
                            EmployeeId = emp != null ? emp.EmployeeId : "",
                            EmployeeCode = emp != null ? emp.EmployeeCode : "",
                            EmployeeLastName = emp != null ? emp.LastName : "",
                            EmployeeFirstName = emp != null ? emp.FirstName : "",
                            LieuNom = l != null ? l.Nom : "Non spécifié"
                        };

            if (!string.IsNullOrWhiteSpace(filterDto.Status))
            {
                query = query.Where(x => x.Status == filterDto.Status);
            }

            if (!string.IsNullOrWhiteSpace(filterDto.EmployeeCode))
            {
                query = query.Where(x => x.EmployeeCode == filterDto.EmployeeCode);
            }

            if (!string.IsNullOrWhiteSpace(filterDto.EmployeeName))
            {
                var searchTerm = filterDto.EmployeeName.ToLower();
                query = query.Where(x => 
                    (x.EmployeeFirstName + " " + x.EmployeeLastName)
                        .ToLower()
                        .Contains(searchTerm));
            }

            if (!string.IsNullOrWhiteSpace(filterDto.MissionType))
            {
                if (Enum.TryParse<MissionType>(filterDto.MissionType, true, out var missionTypeEnum))
                {
                    query = query.Where(x => x.MissionType == missionTypeEnum);
                }
            }

            if (filterDto.PaymentDateMin.HasValue)
            {
                query = query.Where(x => x.UpdatedAt >= filterDto.PaymentDateMin.Value);
            }

            if (filterDto.PaymentDateMax.HasValue)
            {
                var endDate = filterDto.PaymentDateMax.Value.Date.AddDays(1);
                query = query.Where(x => x.UpdatedAt < endDate);
            }

            var groupedQuery = query
                .GroupBy(x => new
                {
                    x.MissionId,
                    x.Name,
                    x.MissionType,
                    x.PaymentType,
                    x.EmployeeId,
                    x.EmployeeCode,
                    x.EmployeeLastName,
                    x.EmployeeFirstName,
                    x.LieuNom
                })
                .Select(g => new
                {
                    g.Key.MissionId,
                    g.Key.Name,
                    g.Key.MissionType,
                    g.Key.PaymentType,
                    g.Key.EmployeeId,
                    g.Key.EmployeeCode,
                    g.Key.EmployeeLastName,
                    g.Key.EmployeeFirstName,
                    g.Key.LieuNom,
                    TotalAmount = g.Sum(x => x.Amount),
                    CreatedAt = g.Min(x => x.CreatedAt),
                    UpdatedAt = g.Max(x => x.UpdatedAt),
                    LatestStatus = g.OrderByDescending(x => x.CreatedAt)
                                .Select(x => x.Status)
                                .FirstOrDefault() ?? "Non défini"
                });

            var totalCount = await groupedQuery.CountAsync();

            var pagedData = await groupedQuery
                .OrderByDescending(g => g.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var internationalMissionIds = pagedData
                .Where(g => g.MissionType == MissionType.International)
                .Select(g => g.MissionId)
                .ToList();

            Dictionary<string, decimal> compensations = new();
            if (internationalMissionIds.Any())
            {
                var compData = await (from c in _context.Compensations
                                    where internationalMissionIds.Contains(c.MissionId)
                                    group c by c.MissionId into g
                                    select new
                                    {
                                        MissionId = g.Key,
                                        TotalCompensation = g.Sum(c => 
                                            c.TransportAmount +
                                            c.BreakfastAmount +
                                            c.LunchAmount +
                                            c.DinnerAmount +
                                            c.AccommodationAmount +
                                            c.CommunicationAmount +
                                            c.VisaAmount +
                                            c.MedicalExpensesAmount +
                                            c.TaxesAmount)
                                    })
                                    .ToDictionaryAsync(c => c.MissionId, c => c.TotalCompensation);
                
                compensations = compData;
            }

            var result = pagedData.Select(g =>
            {
                decimal amountToReturn = 0m;
                
                bool isNationalAndNoteFrais = g.MissionType == MissionType.National && 
                                            g.PaymentType == PaymentType.NoteFrais;
                
                if (isNationalAndNoteFrais)
                {
                    amountToReturn = g.TotalAmount;
                }
                else if (g.MissionType == MissionType.International)
                {
                    var totalCompensation = compensations.ContainsKey(g.MissionId) 
                        ? compensations[g.MissionId] 
                        : 0m;
                    
                    if (g.PaymentType == PaymentType.NoteFrais)
                    {
                        amountToReturn = Math.Max(0m, totalCompensation - g.TotalAmount);
                    }
                    else
                    {
                        amountToReturn = totalCompensation;
                    }
                }
                else if (g.MissionType == MissionType.National && 
                        g.PaymentType == PaymentType.Indemnite)
                {
                    amountToReturn = 0m;
                }
                else
                {
                    amountToReturn = 0m;
                }

                return new ExpenseSummary(
                    g.MissionId,
                    g.Name ?? "Sans titre",
                    g.LatestStatus,
                    $"{g.EmployeeLastName} {g.EmployeeFirstName}".Trim(),
                    g.EmployeeId,
                    g.EmployeeCode,
                    g.LieuNom,
                    g.CreatedAt,
                    amountToReturn
                );
            }).ToList();

            return (result, totalCount);
        }
    }
}