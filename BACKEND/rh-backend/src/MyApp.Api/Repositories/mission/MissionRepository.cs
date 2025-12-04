using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.list.mission;
using MyApp.Api.enums;
using MyApp.Api.Extensions;

namespace MyApp.Api.Repositories.mission
{
    public interface IMissionRepository
    {
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<(IEnumerable<MissionResultDTO> Results, int TotalCount)> SearchAsync(
            MissionSearchFiltersDTO filters,
            int page = 1,
            int pageSize = 20);
        Task<IEnumerable<Mission>> GetAllAsync();
        Task<Mission?> GetByIdAsync(string id);
        Task<Mission?> GetByIdAsync(string employeeId, string missionId);
        Task AddAsync(Mission mission);
        Task UpdateAsync(Mission mission);
        Task DeleteAsync(Mission mission);
        Task SaveChangesAsync();
        Task<MissionStats> GetStatisticsAsync(string[]? matricule = null);
        Task<bool> CancelAsync(string id);
        Task<int> GetOngoingMissionsCountAsync();
        Task<int> GetPlannedMissionsThisMonthCountAsync();
        Task<(int count, DateTime date)> GetPlannedMissionsThisDateCountWithDateAsync();
        Task<(decimal nationalRate, decimal internationalRate)> GetMissionTypesRateAsync();
        Task<(IEnumerable<Mission>, int)> GetWithCompensationByStatusAsync(string? status, int page = 1, int pageSize = 10);
        Task<IEnumerable<Mission>> GetOngoingMissionsWithDetailsAsync();
        Task<bool> CloseAsync(string id);
    }

    public class MissionRepository : IMissionRepository
    {
        private readonly AppDbContext _context;

        public MissionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CloseAsync(string id)
        {
            var mission = await _context.Missions.FirstOrDefaultAsync(m => m.MissionId == id);
            
            if (mission == null) return false;

            if (mission.Status != MissionStatus.Completed)
            {
                throw new InvalidOperationException(
                    "Seules les missions terminées peuvent être clôturées.");
            }

            mission.Status = MissionStatus.Closed;
            mission.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }

        public async Task<IEnumerable<Mission>> GetOngoingMissionsWithDetailsAsync()
        {
            return await _context.Missions
                .AsNoTracking()
                .Include(m => m.Employee)
                .Include(m => m.Lieu)
                .Where(m => m.Status == MissionStatus.InProgress)
                .OrderByDescending(m => m.StartDate)
                .ThenBy(m => m.Name)
                .ToListAsync();
        }

        public async Task<(IEnumerable<Mission>, int)> GetWithCompensationByStatusAsync(string? status, int page = 1, int pageSize = 10)
        {
            var query = _context.Missions
                .AsNoTracking()
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Direction)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Department)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Service)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Site)
                .Include(m => m.Lieu)
                .Include(ma => ma.Transport)
                .Where(ma => _context.Compensations
                    .Any(c => c.MissionId == ma.MissionId
                        && (string.IsNullOrWhiteSpace(status) || c.Status == status)));

            var totalCount = await query.CountAsync();
            var results = await query
                .OrderByDescending(ma => ma.DepartureDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task<(IEnumerable<MissionResultDTO> Results, int TotalCount)> SearchAsync(
            MissionSearchFiltersDTO filters,
            int page = 1,
            int pageSize = 20)
        {
            if (filters == null) throw new ArgumentNullException(nameof(filters));
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;

            var query = _context.Missions
                .Include(m => m.Lieu)
                .Include(m => m.Employee)
                .AsQueryable();

            // Filtre par nom
            if (!string.IsNullOrWhiteSpace(filters.Name))
            {
                var name = filters.Name.Trim();
                query = query.Where(m => m.Name != null && m.Name.Contains(name));
            }

            // Dates de début
            if (filters.MinStartDate.HasValue)
                query = query.Where(m => m.StartDate >= filters.MinStartDate.Value);

            if (filters.MaxStartDate.HasValue)
                query = query.Where(m => m.StartDate <= filters.MaxStartDate.Value);

            // Dates de fin
            if (filters.MinEndDate.HasValue)
                query = query.Where(m => m.EndDate >= filters.MinEndDate.Value);

            if (filters.MaxEndDate.HasValue)
                query = query.Where(m => m.EndDate <= filters.MaxEndDate.Value);

            // Lieu
            if (!string.IsNullOrWhiteSpace(filters.LieuId))
                query = query.Where(m => m.LieuId == filters.LieuId);

            // Employé spécifique
            if (!string.IsNullOrWhiteSpace(filters.EmployeeId))
                query = query.Where(m => m.EmployeeId == filters.EmployeeId);

            // FILTRE PAR STATUTS (enum[])
            if (filters.Status != null && filters.Status.Length > 0)
            {
                // On enlève les valeurs "vides" si jamais (au cas où)
                var statusList = filters.Status
                    .Where(s => s != MissionStatus.Unknown && s != default)
                    .ToArray();
                
                if (statusList.Length > 0)
                {
                    query = query.Where(m => statusList.Contains(m.Status));
                }
            }

            // FILTRE PAR TYPE DE MISSION (enum nullable)
            if (filters.MissionType.HasValue && filters.MissionType != enums.MissionType.Unknown)
            {
                query = query.Where(m => m.MissionType == filters.MissionType.Value);
            }

            if (filters.Type.HasValue)
                query = query.Where(m => m.Type == filters.Type.Value);

            // CORRECTION : Filtre par matricules multiples
            // Utilise la propriété Matricule qui gère à la fois le tableau et la chaîne
            if (filters.Matricule != null && filters.Matricule.Any())
            {
                // Convertir en liste pour éviter les multiples évaluations
                var matriculesList = filters.Matricule
                    .Where(m => !string.IsNullOrWhiteSpace(m))
                    .Select(m => m!.Trim())
                    .Distinct()
                    .ToList();

                if (matriculesList.Any())
                {
                    // IMPORTANT : Vérifie si Employee est null dans la clause WHERE
                    query = query.Where(m => m.Employee != null && 
                                        matriculesList.Contains(m.Employee.EmployeeCode));
                }
            }

            // Comptage total
            var totalCount = await query.CountAsync();

            // Pagination
            var results = await query
                .OrderByDescending(m => m.StartDate)
                .ThenBy(m => m.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new MissionResultDTO
                {
                    MissionId = m.MissionId,
                    MissionType = m.MissionType.GetDescription(),
                    Name = m.Name,
                    Description = m.Description,
                    StartDate = m.StartDate,
                    EndDate = m.EndDate,
                    Status = m.Status.GetDescription(),
                    LieuId = m.LieuId,
                    Lieu = m.Lieu,
                    EmployeeId = m.EmployeeId,
                    Employee = m.Employee,
                    DepartureDate = m.DepartureDate,
                    DepartureTime = m.DepartureTime,
                    ReturnDate = m.ReturnDate,
                    ReturnTime = m.ReturnTime,
                    Duration = m.Duration,
                    IsValidated = m.IsValidated,
                    Type = m.Type.GetDescription(),
                    AllocatedFund = m.AllocatedFund,
                    TransportId = m.TransportId,
                    Transport = m.Transport,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt
                })
                .ToListAsync();

            return (results, totalCount);
        }
        public async Task<IEnumerable<Mission>> GetAllAsync()
        {
            return await _context.Missions
                .Include(m => m.Lieu)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        // Par MissionId uniquement
        public async Task<Mission?> GetByIdAsync(string id)
        {
            return await _context.Missions
                .AsNoTracking()
                .Include(m => m.Employee)
                    .ThenInclude(e => e.Direction)
                .Include(m => m.Employee)
                    .ThenInclude(e => e.Department)
                .Include(m => m.Employee)
                    .ThenInclude(e => e.Service)
                .Include(m => m.Employee)
                    .ThenInclude(e => e.Site)
                .Include(m => m.Transport)
                .Include(m => m.Lieu)
                .FirstOrDefaultAsync(m => m.MissionId == id);
        }

        // Par EmployeeId + MissionId (exactement comme dans l'interface)
        public async Task<Mission?> GetByIdAsync(string employeeId, string missionId)
        {
            return await _context.Missions
                .AsNoTracking()
                .Include(m => m.Employee)
                    .ThenInclude(e => e.Direction)
                .Include(m => m.Employee)
                    .ThenInclude(e => e.Department)
                .Include(m => m.Employee)
                    .ThenInclude(e => e.Service)
                .Include(m => m.Employee)
                    .ThenInclude(e => e.Site)
                .Include(m => m.Transport)
                .Include(m => m.Lieu)
                .FirstOrDefaultAsync(m => m.EmployeeId == employeeId && m.MissionId == missionId);
        }

        public async Task AddAsync(Mission mission)
        {
            await _context.Missions.AddAsync(mission);
        }

        public Task UpdateAsync(Mission mission)
        {
            _context.Missions.Update(mission);
            return Task.CompletedTask;
        }
        public Task DeleteAsync(Mission mission)
        {
            _context.Missions.Remove(mission);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<bool> CancelAsync(string id)
        {
            var mission = await _context.Missions.FirstOrDefaultAsync(m => m.MissionId == id);
            if (mission == null) return false;

            mission.Status = MissionStatus.Canceled;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<MissionStats> GetStatisticsAsync(string[]? matricule = null)
        {
            IQueryable<Mission> query = _context.Missions;

            if (matricule != null && matricule.Any(m => !string.IsNullOrWhiteSpace(m)))
            {
                var matricules = matricule.Where(m => !string.IsNullOrWhiteSpace(m)).ToArray();

                query = query.Where(m => _context.Missions
                    .Any(ma => ma.MissionId == m.MissionId &&
                               _context.Employees
                                   .Where(e => matricules.Contains(e.EmployeeCode))
                                   .Select(e => e.EmployeeId)
                                   .Contains(ma.EmployeeId)));
            }

            var total = await query.CountAsync();
            var enCours = await query.CountAsync(m => m.Status == MissionStatus.InProgress);
            var planifiee = await query.CountAsync(m => m.Status == MissionStatus.Planned);
            var terminee = await query.CountAsync(m => m.Status == MissionStatus.Completed);
            var annulee = await query.CountAsync(m => m.Status == MissionStatus.Canceled);

            return new MissionStats
            {
                Total = total,
                EnCours = enCours,
                Planifiee = planifiee,
                Terminee = terminee,
                Annulee = annulee
            };
        }

        public async Task<int> GetOngoingMissionsCountAsync()
        {
            return await _context.Missions
                .CountAsync(m => m.Status == MissionStatus.InProgress);
        }

        public async Task<int> GetPlannedMissionsThisMonthCountAsync()
        {
            var now = DateTime.Now;
            return await _context.Missions
                .CountAsync(m => (m.Status == MissionStatus.Planned)
                              && m.StartDate.Year == now.Year
                              && m.StartDate.Month == now.Month);
        }

        public async Task<(int count, DateTime date)> GetPlannedMissionsThisDateCountWithDateAsync()
        {
            var now = DateTime.Today;
            var query = _context.Missions
                .Where(m => (m.Status == MissionStatus.Planned)
                         && m.StartDate.Year == now.Year
                         && m.StartDate.Month == now.Month);

            var count = await query.CountAsync();
            var earliestDate = await query
                .OrderBy(m => m.StartDate)
                .Select(m => m.StartDate)
                .FirstOrDefaultAsync();

            return (count, count > 0 ? earliestDate : DateTime.MinValue);
        }

        public async Task<(decimal nationalRate, decimal internationalRate)> GetMissionTypesRateAsync()
        {
            var total = await _context.Missions.CountAsync();
            if (total == 0)
                return (0m, 0m);

            var nationalCount = await _context.Missions
            .CountAsync(m => m.MissionType == MissionType.National);
            
            var internationalCount = await _context.Missions
            .CountAsync(m => m.MissionType == MissionType.International);

            var nationalRate = Math.Round((decimal)nationalCount / total * 100m, 2);
            var internationalRate = Math.Round((decimal)internationalCount / total * 100m, 2);

            return (nationalRate, internationalRate);
        }
    }
}