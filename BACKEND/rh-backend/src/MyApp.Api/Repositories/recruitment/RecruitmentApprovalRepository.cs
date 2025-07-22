using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentApprovalRepository
    {
        Task ValidateAsync(string recruitmentRequestId, string approverId);
        Task RecommendAsync(string recruitmentRequestId, string approverId, string comment);
        Task<IEnumerable<RecruitmentApproval>> GetByApproverIdAsync(string approverId);
        Task<IEnumerable<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId);
        Task<IEnumerable<RecruitmentApproval>> GetByRecruitmentRequestIdAsync(string recruitmentRequestId);
        Task AddRangeAsync(IEnumerable<RecruitmentApproval> entities);
        Task AddAsync(RecruitmentApproval approval);
        Task UpdateAsync(RecruitmentApproval approval);
        Task<RecruitmentApproval?> GetAsync(string recruitmentRequestId, string approverId, string flowId);
        Task SaveChangesAsync();
    }

    public class RecruitmentApprovalRepository : IRecruitmentApprovalRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentApprovalRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task ValidateAsync(string recruitmentRequestId, string approverId)
        {
            var approval = await _context.RecruitmentApprovals
                .FirstOrDefaultAsync(a => a.RecruitmentRequestId == recruitmentRequestId && a.ApproverId == approverId);

            if (approval == null)
            {
                throw new InvalidOperationException("RecruitmentApproval not found.");
            }

            approval.Status = "Validé";
            approval.ApprovalDate = DateTime.UtcNow;
            approval.UpdatedAt = DateTime.UtcNow;

            _context.RecruitmentApprovals.Update(approval);
            await _context.SaveChangesAsync();
        }

        public async Task RecommendAsync(string recruitmentRequestId, string approverId, string comment)
        {
            var approval = await _context.RecruitmentApprovals
                .FirstOrDefaultAsync(a => a.RecruitmentRequestId == recruitmentRequestId && a.ApproverId == approverId);

            if (approval == null)
            {
                throw new InvalidOperationException("RecruitmentApproval not found.");
            }

            approval.Status = "Recommandé";
            approval.Comment = comment;
            approval.UpdatedAt = DateTime.UtcNow;

            _context.RecruitmentApprovals.Update(approval);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<RecruitmentApproval>> GetByApproverIdAsync(string approverId)
        {
            return await _context.RecruitmentApprovals
                .Where(a => a.ApproverId == approverId)
                .OrderByDescending(a => a.CreatedAt)
                .Include(a => a.RecruitmentRequest)
                .ToListAsync();
        }

        public async Task<IEnumerable<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId)
        {
            return await _context.RecruitmentApprovals
                .Where(a => a.ApproverId == approverId && a.Status == status)
                .OrderByDescending(a => a.CreatedAt)
                .Include(a => a.RecruitmentRequest)
                .ToListAsync();
        }

        public async Task<IEnumerable<RecruitmentApproval>> GetByRecruitmentRequestIdAsync(string recruitmentRequestId)
        {
            return await _context.RecruitmentApprovals
                .Where(a => a.RecruitmentRequestId == recruitmentRequestId)
                .Select(a => new RecruitmentApproval
                {
                    ApproverId = a.ApproverId,
                    Status = a.Status,
                    ApprovalOrder = a.ApprovalOrder,
                    ApprovalDate = a.ApprovalDate
                })
                .OrderBy(a => a.ApprovalOrder)
                .ToListAsync();
        }

        public async Task<RecruitmentApproval?> GetAsync(string recruitmentRequestId, string approverId, string flowId)
        {
            return await _context.RecruitmentApprovals.FindAsync(recruitmentRequestId, approverId, flowId);
        }
        
        public async Task AddRangeAsync(IEnumerable<RecruitmentApproval> entities)
        {
            await _context.RecruitmentApprovals.AddRangeAsync(entities);
        }

        public async Task AddAsync(RecruitmentApproval approval)
        {
            if (approval == null)
            {
                throw new ArgumentNullException(nameof(approval));
            }

            await _context.RecruitmentApprovals.AddAsync(approval);
        }

        public async Task UpdateAsync(RecruitmentApproval approval)
        {
            if (approval == null)
            {
                throw new ArgumentNullException(nameof(approval));
            }

            _context.RecruitmentApprovals.Update(approval);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}