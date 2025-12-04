using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IMissionReportRepository
    {
        Task<IEnumerable<MissionReport>> GetAllAsync();
        Task<MissionReport?> GetByIdAsync(string id);
        Task<IEnumerable<MissionReport>> GetByMissionIdAsync(string assignationId);
        Task AddAsync(MissionReport entity);
        Task UpdateAsync(MissionReport entity);
        Task DeleteAsync(MissionReport entity);
        Task SaveChangesAsync();
    }

    public class MissionReportRepository : IMissionReportRepository
    {
        private readonly AppDbContext _context;

        public MissionReportRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MissionReport>> GetAllAsync()
        {
            return await _context.MissionReports
                .Include(mr => mr.User)
                .Include(mr => mr.Mission)
                .OrderByDescending(mr => mr.CreatedAt)
                .ToListAsync();
        }

        public async Task<MissionReport?> GetByIdAsync(string id)
        {
            return await _context.MissionReports
                .AsNoTracking()
                .Include(mr => mr.User)
                .Include(mr => mr.Mission)
                .FirstOrDefaultAsync(mr => mr.MissionReportId == id);
        }

        public async Task<IEnumerable<MissionReport>> GetByMissionIdAsync(string missionId)
        {
            return await _context.MissionReports
                .Include(mr => mr.User)
                .Where(mr => mr.MissionId == missionId)
                .OrderByDescending(mr => mr.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(MissionReport entity) => await _context.MissionReports.AddAsync(entity);

        public Task UpdateAsync(MissionReport entity)
        {
            _context.MissionReports.Update(entity);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(MissionReport entity)
        {
            _context.MissionReports.Remove(entity);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
