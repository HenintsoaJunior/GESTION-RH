using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentRequestCommentsRepository
    {
        Task<IEnumerable<RecruitmentRequestComments>> GetAllAsync();
        Task<RecruitmentRequestComments?> GetByIdAsync(string recruitmentRequestId, string commentId);
        Task<IEnumerable<RecruitmentRequestComments>> GetByRecruitmentRequestIdAsync(string recruitmentRequestId);
        Task<IEnumerable<RecruitmentRequestComments>> GetByCommentIdAsync(string commentId);
        Task AddAsync(RecruitmentRequestComments recruitmentRequestComment);
        Task DeleteAsync(RecruitmentRequestComments recruitmentRequestComment);
        Task SaveChangesAsync();
    }

    public class RecruitmentRequestCommentsRepository : IRecruitmentRequestCommentsRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentRequestCommentsRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RecruitmentRequestComments>> GetAllAsync()
        {
            return await _context.RecruitmentRequestComments
                .Include(r => r.RecruitmentRequest)
                .Include(r => r.Comment)
                .ToListAsync();
        }

        public async Task<RecruitmentRequestComments?> GetByIdAsync(string recruitmentRequestId, string commentId)
        {
            return await _context.RecruitmentRequestComments
                .Include(r => r.RecruitmentRequest)
                .Include(r => r.Comment)
                .FirstOrDefaultAsync(r => r.RecruitmentRequestId == recruitmentRequestId && r.CommentId == commentId);
        }

       public async Task<IEnumerable<RecruitmentRequestComments>> GetByRecruitmentRequestIdAsync(string recruitmentRequestId)
        {
            return await _context.RecruitmentRequestComments
                .Where(r => r.RecruitmentRequestId == recruitmentRequestId)
                .Include(r => r.Comment)
                    .ThenInclude(c => c!.User)
                .Include(r => r.Comment)
                    .ThenInclude(c => c!.RecruitmentRequestComments)
                .ToListAsync();
        }


        public async Task<IEnumerable<RecruitmentRequestComments>> GetByCommentIdAsync(string commentId)
        {
            return await _context.RecruitmentRequestComments
                .Where(r => r.CommentId == commentId)
                .Include(r => r.RecruitmentRequest)
                .Include(r => r.Comment)
                .ToListAsync();
        }

        public async Task AddAsync(RecruitmentRequestComments recruitmentRequestComment)
        {
            await _context.RecruitmentRequestComments.AddAsync(recruitmentRequestComment);
        }

        public async Task DeleteAsync(RecruitmentRequestComments recruitmentRequestComment)
        {
            _context.RecruitmentRequestComments.Remove(recruitmentRequestComment);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}