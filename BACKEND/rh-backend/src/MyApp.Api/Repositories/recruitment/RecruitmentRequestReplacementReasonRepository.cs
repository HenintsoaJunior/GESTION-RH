using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentRequestReplacementReasonRepository
    {
        Task<IEnumerable<RecruitmentRequestReplacementReason>> GetAllAsync();
       Task<IEnumerable<RecruitmentRequestReplacementReason>> GetByRequestIdAsync(string requestId);
        Task AddAsync(RecruitmentRequestReplacementReason entity);
        Task DeleteAsync(string requestId);
        Task SaveChangesAsync();
    }

    public class RecruitmentRequestReplacementReasonRepository : IRecruitmentRequestReplacementReasonRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentRequestReplacementReasonRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RecruitmentRequestReplacementReason>> GetAllAsync()
        {
            return await _context.RecruitmentRequestReplacementReasons
                .Include(r => r.RecruitmentRequest)
                .Include(r => r.ReplacementReason)
                .ToListAsync();
        }

        public async Task<IEnumerable<RecruitmentRequestReplacementReason>> GetByRequestIdAsync(string requestId)
        {
            return await _context.RecruitmentRequestReplacementReasons
                .Where(r => r.RecruitmentRequestId == requestId)
                .Include(r => r.ReplacementReason)
                .ToListAsync();
        }

        public async Task AddAsync(RecruitmentRequestReplacementReason entity)
        {
            await _context.RecruitmentRequestReplacementReasons.AddAsync(entity);
        }

        public async Task DeleteAsync(string requestId)
        {
            var existing = await _context.RecruitmentRequestReplacementReasons.FindAsync(requestId);
            if (existing != null)
            {
                _context.RecruitmentRequestReplacementReasons.Remove(existing);
            }
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
