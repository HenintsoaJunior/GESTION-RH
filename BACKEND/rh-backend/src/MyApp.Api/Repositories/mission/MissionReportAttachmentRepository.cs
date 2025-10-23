using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IMissionReportAttachmentRepository
    {
        Task<IEnumerable<MissionReportAttachment>> GetByMissionReportIdAsync(string missionReportId);
        Task AddAsync(MissionReportAttachment entity);
        Task DeleteAsync(MissionReportAttachment entity);
        Task SaveChangesAsync();
    }

    public class MissionReportAttachmentRepository : IMissionReportAttachmentRepository
    {
        private readonly AppDbContext _context;

        public MissionReportAttachmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MissionReportAttachment>> GetByMissionReportIdAsync(string missionReportId)
        {
            return await _context.MissionReportAttachments
                .AsNoTracking()
                .Where(a => a.MissionReportId == missionReportId)
                .ToListAsync();
        }

        public async Task AddAsync(MissionReportAttachment entity)
        {
            await _context.MissionReportAttachments.AddAsync(entity);
        }

        public Task DeleteAsync(MissionReportAttachment entity)
        {
            _context.MissionReportAttachments.Remove(entity);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}