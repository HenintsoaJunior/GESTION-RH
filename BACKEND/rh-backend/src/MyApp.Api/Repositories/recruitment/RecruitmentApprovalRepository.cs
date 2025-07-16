using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentApprovalRepository
    {
        Task<IEnumerable<RecruitmentApproval>> GetByApprovalFlowAsync(string flowId);
        Task<IEnumerable<RecruitmentApproval>> GetByApproverIdAsync(string approverId);
        Task<IEnumerable<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId);
        Task AddAsync(RecruitmentApproval approval, IEnumerable<ApprovalFlow> approvalFlows);
        Task UpdateAsync(RecruitmentApproval approval);
        Task<RecruitmentApproval?> GetAsync(string requestId, string approverId, string flowId);
        Task SaveChangesAsync();
    }

    public class RecruitmentApprovalRepository : IRecruitmentApprovalRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentApprovalRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RecruitmentApproval>> GetByApprovalFlowAsync(string flowId)
        {
            return await _context.RecruitmentApprovals
                .Where(a => a.ApprovalFlowId == flowId)
                .OrderByDescending(a => a.CreatedAt)
                .Include(a => a.RecruitmentRequest)
                .Include(a => a.Approver)
                .Include(a => a.ApprovalFlow)
                .ToListAsync();
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


        public async Task<RecruitmentApproval?> GetAsync(string requestId, string approverId, string flowId)
        {
            return await _context.RecruitmentApprovals.FindAsync(requestId, approverId, flowId);
        }

        public async Task AddAsync(RecruitmentApproval approval, IEnumerable<ApprovalFlow> approvalFlows)
        {
            foreach (var flow in approvalFlows)
            {
                approval.ApprovalFlowId = flow.ApprovalFlowId; 
                approval.ApprovalOrder = flow.ApprovalOrder;
                await _context.RecruitmentApprovals.AddAsync(approval);
            }
        }

        public Task UpdateAsync(RecruitmentApproval approval)
        {
            _context.RecruitmentApprovals.Update(approval);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
