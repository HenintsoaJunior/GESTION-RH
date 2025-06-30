using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentApprovalRepository
    {
        Task<IEnumerable<RecruitmentApproval>> GetByApproverAsync(string approverId);
        Task<IEnumerable<RecruitmentApproval>> GetByRequestIdAsync(string requestId);
        Task<RecruitmentApproval?> GetAsync(string approverId, string requestId);
        Task AddAsync(RecruitmentApproval approval);
        Task UpdateAsync(RecruitmentApproval approval);
        Task SaveChangesAsync();
    }
    public class RecruitmentApprovalRepository : IRecruitmentApprovalRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentApprovalRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RecruitmentApproval>> GetByApproverAsync(string approverId)
        {
            return await _context.RecruitmentApprovals
                .Where(a => a.ApproverId == approverId)
                .ToListAsync();
        }

        public async Task<IEnumerable<RecruitmentApproval>> GetByRequestIdAsync(string requestId)
        {
            return await _context.RecruitmentApprovals
                .Where(a => a.RecruitmentRequestId == requestId)
                .ToListAsync();
        }

        public async Task<RecruitmentApproval?> GetAsync(string approverId, string requestId)
        {
            return await _context.RecruitmentApprovals
                .FindAsync(approverId, requestId);
        }

        public async Task AddAsync(RecruitmentApproval approval)
        {
            await _context.RecruitmentApprovals.AddAsync(approval);
        }

        public Task UpdateAsync(RecruitmentApproval approval)
        {
            EntityAuditHelper.SetUpdatedTimestamp(approval);
            _context.RecruitmentApprovals.Update(approval);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
