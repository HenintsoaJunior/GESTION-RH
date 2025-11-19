using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IMissionAssignationRepository
    {
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<IEnumerable<string>> GetAssignedEmployeeIdsAsync(string missionId);
        Task<IEnumerable<MissionAssignation>> GetAllAsync();
        Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId, string? transportId);
        Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId);
        Task<MissionAssignation?> GetByIdMissionAsync(string missionId);
        Task<MissionAssignation?> GetByAssignationIdAsync(string assignationId);
        Task<IEnumerable<MissionAssignation>> GetAllByMissionIdAsync(string missionId);
        Task<IEnumerable<MissionAssignation>> GetFilteredAssignationsAsync(string? employeeId, string? missionId);
        Task<(IEnumerable<MissionAssignation>, int)> GetWithCompensationByStatusAsync(string? status, int page = 1, int pageSize = 10);
        Task<(IEnumerable<MissionAssignation>, int)> SearchAsync(MissionAssignationSearchFiltersDTO filters, int page, int pageSize);
        Task AddAsync(MissionAssignation missionAssignation);
        Task UpdateAsync(MissionAssignation missionAssignation);
        Task DeleteAsync(MissionAssignation missionAssignation);
        Task SaveChangesAsync();
    }

    public class MissionAssignationRepository : IMissionAssignationRepository
    {
        private readonly AppDbContext _context;

        public MissionAssignationRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }

        public async Task<IEnumerable<MissionAssignation>> GetAllByMissionIdAsync(string missionId)
        {
            if (string.IsNullOrWhiteSpace(missionId))
            {
                throw new ArgumentException("L'ID de la mission ne peut pas être vide.", nameof(missionId));
            }

            return await _context.MissionAssignations
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Direction)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Department)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Service)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Site)
                .Include(ma => ma.Mission!)
                    .ThenInclude(m => m.Lieu)
                .Include(ma => ma.Transport)
                .Where(ma => ma.MissionId == missionId)
                .OrderBy(ma => ma.DepartureDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<string>> GetAssignedEmployeeIdsAsync(string missionId)
        {
            return await _context.MissionAssignations
                .Where(ma => ma.MissionId == missionId)
                .Select(ma => ma.EmployeeId)
                .Distinct()
                .ToListAsync();
        }

        public async Task<IEnumerable<MissionAssignation>> GetAllAsync()
        {
            return await _context.MissionAssignations
                .Include(ma => ma.Employee)
                .Include(ma => ma.Mission)
                .Include(ma => ma.Transport)
                .OrderBy(ma => ma.DepartureDate)
                .ToListAsync();
        }

        public async Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId, string? transportId)
        {
            return await _context.MissionAssignations
                .AsNoTracking()
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Direction)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Department)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Service)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Site)
                .Include(ma => ma.Mission!)
                .ThenInclude(e => e.Lieu)
                .Include(ma => ma.Transport)
                .FirstOrDefaultAsync(ma => 
                    ma.EmployeeId == employeeId && 
                    ma.MissionId == missionId && 
                    ma.TransportId == transportId);
        }
        
        public async Task<(IEnumerable<MissionAssignation>, int)> GetWithCompensationByStatusAsync(string? status, int page = 1, int pageSize = 10)
        {
            var query = _context.MissionAssignations
                .AsNoTracking()
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Direction)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Department)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Service)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Site)
                .Include(ma => ma.Mission!)
                    .ThenInclude(m => m.Lieu)
                .Include(ma => ma.Transport)
                .Where(ma => _context.Compensations
                    .Any(c => c.AssignationId == ma.AssignationId
                        && (string.IsNullOrWhiteSpace(status) || c.Status == status)));

            var totalCount = await query.CountAsync();
            var results = await query
                .OrderByDescending(ma => ma.DepartureDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }
        public async Task<MissionAssignation?> GetByIdMissionAsync(string missionId)
        {
            return await _context.MissionAssignations
                .AsNoTracking()
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Direction)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Department)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Service)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Site)
                .Include(ma => ma.Mission!)
                .ThenInclude(e => e.Lieu)
                .Include(ma => ma.Transport)
                .FirstOrDefaultAsync(ma =>
                    ma.MissionId == missionId);
        }
        
        public async Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId)
        {
            return await _context.MissionAssignations
                .AsNoTracking()
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Direction)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Department)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Service)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Site)
                .Include(ma => ma.Mission!)
                .ThenInclude(e => e.Lieu)
                .Include(ma => ma.Transport)
                .FirstOrDefaultAsync(ma =>
                    ma.EmployeeId == employeeId &&
                    ma.MissionId == missionId);
        }
        
        public async Task<MissionAssignation?> GetByAssignationIdAsync(string assignationId)
        {
            return await _context.MissionAssignations
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Direction)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Department)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Service)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Site)
                .Include(ma => ma.Mission!)
                .ThenInclude(m => m.Lieu)
                .Include(ma => ma.Transport)
                .FirstOrDefaultAsync(ma => ma.AssignationId == assignationId);
        }

        public async Task<IEnumerable<MissionAssignation>> GetFilteredAssignationsAsync(string? employeeId, string? missionId)
        {
            var query = _context.MissionAssignations
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Direction)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Department)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Service)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Site)
                .Include(ma => ma.Mission!)
                    .ThenInclude(m => m.Lieu)
                .Include(ma => ma.Transport)
                .AsQueryable();

            // Apply filters only if provided
            if (!string.IsNullOrWhiteSpace(employeeId))
            {
                query = query.Where(ma => ma.EmployeeId == employeeId);
            }

            if (!string.IsNullOrWhiteSpace(missionId))
            {
                query = query.Where(ma => ma.MissionId == missionId);
            }
            // Sort by departure date
            return await query
                .OrderBy(ma => ma.DepartureDate)
                .ToListAsync();
        }

        public async Task<(IEnumerable<MissionAssignation>, int)> SearchAsync(MissionAssignationSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.MissionAssignations
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Direction)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Department)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Service)
                .Include(ma => ma.Employee)
                    .ThenInclude(e => e.Site)
                .Include(ma => ma.Mission)
                    .ThenInclude(m => m!.Lieu)
                .Include(ma => ma.Transport)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.EmployeeId))
            {
                query = query.Where(ma => ma.EmployeeId == filters.EmployeeId);
            }

            if (!string.IsNullOrWhiteSpace(filters.MissionId))
            {
                query = query.Where(ma => ma.MissionId.Contains(filters.MissionId));
            }

            if (!string.IsNullOrWhiteSpace(filters.TransportId))
            {
                query = query.Where(ma => ma.TransportId != null && ma.TransportId.Contains(filters.TransportId));
            }

            if (!string.IsNullOrWhiteSpace(filters.LieuId))
            {
                query = query.Where(ma => ma.Mission != null && ma.Mission.LieuId.Contains(filters.LieuId));
            }

            if (!string.IsNullOrWhiteSpace(filters.MissionType))
            {
                query = query.Where(ma => ma.Mission != null && ma.Mission.MissionType == filters.MissionType);
            }

            if (filters.Matricule?.Any(m => !string.IsNullOrWhiteSpace(m)) == true)
            {
                query = query.Where(ma => ma.Employee != null && filters.Matricule.Contains(ma.Employee.EmployeeCode));
            }

            if (filters.MinDepartureDate.HasValue)
            {
                query = query.Where(ma => ma.DepartureDate >= filters.MinDepartureDate.Value);
            }

            if (filters.MaxDepartureDate.HasValue)
            {
                query = query.Where(ma => ma.DepartureDate <= filters.MaxDepartureDate.Value);
            }

            if (filters.MinArrivalDate.HasValue)
            {
                query = query.Where(ma => ma.ReturnDate != null && ma.ReturnDate >= filters.MinArrivalDate.Value);
            }

            if (filters.MaxArrivalDate.HasValue)
            {
                query = query.Where(ma => ma.ReturnDate != null && ma.ReturnDate <= filters.MaxArrivalDate.Value);
            }

            if (filters.Status?.Any(s => !string.IsNullOrWhiteSpace(s)) == true)
            {
                
                var allStatuses = await query
                    .Where(ma => ma.Mission != null)
                    .Select(ma => new { ma.Mission!.Status, ma.MissionId })
                    .ToListAsync();

                var distinctStatuses = allStatuses.Select(x => x.Status).Distinct().ToList();

                query = query.Where(ma => ma.Mission != null && filters.Status.Contains(ma.Mission.Status));

                var countAfter = await query.CountAsync();
            }

            var totalCount = await query.CountAsync();
            var results = await query
                .OrderByDescending(ma => ma.DepartureDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task AddAsync(MissionAssignation missionAssignation)
        {
            await _context.MissionAssignations.AddAsync(missionAssignation);
        }

        public Task UpdateAsync(MissionAssignation missionAssignation)
        {
            _context.MissionAssignations.Update(missionAssignation);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(MissionAssignation missionAssignation)
        {
            _context.MissionAssignations.Remove(missionAssignation);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}