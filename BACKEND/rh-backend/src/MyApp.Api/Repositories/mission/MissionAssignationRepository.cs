using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.search.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IMissionAssignationRepository
    {
        Task<IEnumerable<MissionAssignation>> GetAllAsync();
        Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId, string transportId);
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

        public async Task<IEnumerable<MissionAssignation>> GetAllAsync()
        {
            return await _context.MissionAssignations
                .Include(ma => ma.Employee)
                .Include(ma => ma.Mission)
                .Include(ma => ma.Transport)
                .OrderBy(ma => ma.DepartureDate)
                .ToListAsync();
        }

        public async Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId, string transportId)
        {
            return await _context.MissionAssignations
                .Include(ma => ma.Employee)
                .Include(ma => ma.Mission)
                .Include(ma => ma.Transport)
                .FirstOrDefaultAsync(ma => 
                    ma.EmployeeId == employeeId && 
                    ma.MissionId == missionId && 
                    ma.TransportId == transportId);
        }

        public async Task<(IEnumerable<MissionAssignation>, int)> SearchAsync(MissionAssignationSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.MissionAssignations
                .Include(ma => ma.Employee)
                .Include(ma => ma.Mission)
                .Include(ma => ma.Transport)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.EmployeeId))
            {
                query = query.Where(ma => ma.EmployeeId != null && ma.EmployeeId.Contains(filters.EmployeeId));
            }

            if (!string.IsNullOrWhiteSpace(filters.MissionId))
            {
                query = query.Where(ma => ma.MissionId != null && ma.MissionId.Contains(filters.MissionId));
            }

            if (!string.IsNullOrWhiteSpace(filters.TransportId))
            {
                query = query.Where(ma => ma.TransportId != null && ma.TransportId.Contains(filters.TransportId));
            }

            if (filters.DepartureDateMin.HasValue)
            {
                query = query.Where(ma => ma.DepartureDate >= filters.DepartureDateMin.Value);
            }

            if (filters.DepartureDateMax.HasValue)
            {
                query = query.Where(ma => ma.DepartureDate <= filters.DepartureDateMax.Value);
            }

            if (!string.IsNullOrWhiteSpace(filters.Status))
            {
                query = query.Where(ma => ma.Mission != null && ma.Mission.Status != null && ma.Mission.Status.Contains(filters.Status));
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