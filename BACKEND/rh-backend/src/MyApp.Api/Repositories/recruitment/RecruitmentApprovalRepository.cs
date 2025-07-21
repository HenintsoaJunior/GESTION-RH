using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentApprovalRepository
    {
        Task<List<RecruitmentApproval>> GetByApproverIdAsync(string approverId);
        Task<List<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId);
        Task<List<RecruitmentApproval>> GetByRecruitmentRequestIdAsync(string recruitmentRequestId);
        Task<RecruitmentApproval?> GetAsync(string requestId, string approverId, int flowId);
        Task AddAsync(RecruitmentApproval approval, IEnumerable<ApprovalFlowEmployee> approvalFlows);
        Task AddAsync(RecruitmentApproval approval);
        Task UpdateAsync(RecruitmentApproval approval);
        Task SaveChangesAsync();
    }

    public class RecruitmentApprovalRepository : IRecruitmentApprovalRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentApprovalRepository(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<List<RecruitmentApproval>> GetByApproverIdAsync(string approverId)
        {
            if (string.IsNullOrEmpty(approverId))
            {
                throw new ArgumentException("ApproverId cannot be null or empty.", nameof(approverId));
            }

            return await _context.RecruitmentApprovals
                .Where(a => a.ApproverId == approverId)
                .OrderByDescending(a => a.CreatedAt)
                .Include(a => a.RecruitmentRequest)
                .Include(a => a.Approver)
                .ToListAsync();
        }

        public async Task<List<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId)
        {
            if (string.IsNullOrEmpty(status))
            {
                throw new ArgumentException("Status cannot be null or empty.", nameof(status));
            }

            if (string.IsNullOrEmpty(approverId))
            {
                throw new ArgumentException("ApproverId cannot be null or empty.", nameof(approverId));
            }

            return await _context.RecruitmentApprovals
                .Where(a => a.ApproverId == approverId && a.Status == status)
                .OrderByDescending(a => a.CreatedAt)
                .Include(a => a.RecruitmentRequest)
                .Include(a => a.Approver)
                .ToListAsync();
        }

        public async Task<List<RecruitmentApproval>> GetByRecruitmentRequestIdAsync(string recruitmentRequestId)
        {
            if (string.IsNullOrEmpty(recruitmentRequestId))
            {
                throw new ArgumentException("RecruitmentRequestId cannot be null or empty.", nameof(recruitmentRequestId));
            }

            return await _context.RecruitmentApprovals
                .Where(a => a.RecruitmentRequestId == recruitmentRequestId)
                .OrderBy(a => a.ApprovalOrder)
                .Include(a => a.RecruitmentRequest)
                .Include(a => a.Approver)
                .ToListAsync();
        }

        public async Task<RecruitmentApproval?> GetAsync(string requestId, string approverId, int flowId)
        {
            if (string.IsNullOrEmpty(requestId))
            {
                throw new ArgumentException("RequestId cannot be null or empty.", nameof(requestId));
            }

            if (string.IsNullOrEmpty(approverId))
            {
                throw new ArgumentException("ApproverId cannot be null or empty.", nameof(approverId));
            }

            return await _context.RecruitmentApprovals
                .Include(a => a.RecruitmentRequest)
                .Include(a => a.Approver)
                .FirstOrDefaultAsync(a => a.RecruitmentRequestId == requestId
                    && a.ApproverId == approverId
                    && a.ApprovalOrder == flowId);
        }

        public async Task AddAsync(RecruitmentApproval approval, IEnumerable<ApprovalFlowEmployee> approvalFlows)
        {
            if (approval == null)
            {
                throw new ArgumentNullException(nameof(approval));
            }

            if (approvalFlows == null)
            {
                throw new ArgumentNullException(nameof(approvalFlows));
            }

            foreach (var flow in approvalFlows)
            {
                if (flow?.Employee != null && flow?.ApprovalFlow != null)
                {
                    var newApproval = new RecruitmentApproval
                    {
                        RecruitmentRequestId = approval.RecruitmentRequestId,
                        ApproverId = flow.Employee.EmployeeId,
                        ApprovalOrder = flow.ApprovalFlow.ApprovalOrder,
                        Status = approval.Status,
                        ApprovalDate = approval.ApprovalDate,
                        Comment = approval.Comment,
                        Signature = approval.Signature
                    };
                    await _context.RecruitmentApprovals.AddAsync(newApproval);
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

        public async Task UpdateAsync(RecruitmentApproval approval)
        {
            if (approval == null)
            {
                throw new ArgumentNullException(nameof(approval));
            }

            _context.RecruitmentApprovals.Update(approval);
            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}