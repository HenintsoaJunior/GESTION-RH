using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IMissionAssignationRepository
    {
        Task<IEnumerable<MissionAssignation>> GetAllAsync();
        Task<MissionAssignation?> GetByKeyAsync(string employeeId, string missionId);
        Task AddAsync(MissionAssignation entity);
        Task UpdateAsync(MissionAssignation entity);
        Task DeleteAsync(MissionAssignation entity);
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
                .Include(m => m.Employee)
                .Include(m => m.Mission)
                .Include(m => m.Transport)
                .ToListAsync();
        }

        public async Task<MissionAssignation?> GetByKeyAsync(string employeeId, string missionId)
        {
            return await _context.MissionAssignations.FindAsync(employeeId, missionId);
        }

        public async Task AddAsync(MissionAssignation entity)
        {
            await _context.MissionAssignations.AddAsync(entity);
        }

        public Task UpdateAsync(MissionAssignation entity)
        {
            _context.MissionAssignations.Update(entity);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(MissionAssignation entity)
        {
            _context.MissionAssignations.Remove(entity);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
