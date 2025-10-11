using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IMissionCommentsRepository
    {
        Task<IEnumerable<MissionComments>> GetAllAsync();
        Task<MissionComments?> GetByIdAsync(string missionId, string commentId);
        Task<IEnumerable<MissionComments>> GetByMissionIdAsync(string missionId);
        Task<IEnumerable<MissionComments>> GetByCommentIdAsync(string commentId);
        Task AddAsync(MissionComments missionComments);
        Task DeleteAsync(MissionComments missionComments);
        Task SaveChangesAsync();
    }

    public class MissionCommentsRepository : IMissionCommentsRepository
    {
        private readonly AppDbContext _context;

        public MissionCommentsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MissionComments>> GetAllAsync()
        {
            return await _context.MissionComments
                .Include(r => r.Mission)
                .Include(r => r.Comment)
                .ToListAsync();
        }

        public async Task<MissionComments?> GetByIdAsync(string missionId, string commentId)
        {
            return await _context.MissionComments
                .Include(r => r.Mission)
                .Include(r => r.Comment)
                .FirstOrDefaultAsync(r => r.MissionId == missionId && r.CommentId == commentId);
        }

       public async Task<IEnumerable<MissionComments>> GetByMissionIdAsync(string missionId)
        {
            return await _context.MissionComments
                .Where(r => r.MissionId == missionId)
                .Include(r => r.Comment)
                    .ThenInclude(c => c!.User)
                .Include(r => r.Comment)
                    .ThenInclude(c => c!.MissionComments)
                .ToListAsync();
        }


        public async Task<IEnumerable<MissionComments>> GetByCommentIdAsync(string commentId)
        {
            return await _context.MissionComments
                .Where(r => r.CommentId == commentId)
                .Include(r => r.Mission)
                .Include(r => r.Comment)
                .ToListAsync();
        }

        public async Task AddAsync(MissionComments missionComments)
        {
            await _context.MissionComments.AddAsync(missionComments);
        }

        public async Task DeleteAsync(MissionComments missionComments)
        {
            _context.MissionComments.Remove(missionComments);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}