using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentApprovalRepository
    {
        Task<IEnumerable<RecruitmentApproval>> GetByApproverIdAsync(string approverId);
        Task<IEnumerable<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId);
        Task AddAsync(RecruitmentApproval approval, IEnumerable<ApprovalFlowEmployee> approvalFlows);
        Task AddAsync(RecruitmentApproval approval);
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

        public async Task AddAsync(RecruitmentApproval approval, IEnumerable<ApprovalFlowEmployee> approvalFlows)
        {
            if (approvalFlows == null)
            {
                throw new ArgumentNullException(nameof(approvalFlows));
            }

            foreach (var flow in approvalFlows)
            {
                if (flow?.Employee != null && flow?.ApprovalFlow != null)
                {
                    approval.ApproverId = flow.Employee.EmployeeId; 
                    approval.ApprovalOrder = flow.ApprovalFlow.ApprovalOrder;
                    await _context.RecruitmentApprovals.AddAsync(approval);
                }
            }
        }

        public async Task AddAsync(RecruitmentApproval approval)
        {
            if (approval == null)
            {
                throw new ArgumentNullException(nameof(approval));
            }
            
            await _context.RecruitmentApprovals.AddAsync(approval);
        }

        public Task UpdateAsync(RecruitmentApproval approval)
        {
            if (approval == null)
            {
                throw new ArgumentNullException(nameof(approval));
            }

            _context.RecruitmentApprovals.Update(approval);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}