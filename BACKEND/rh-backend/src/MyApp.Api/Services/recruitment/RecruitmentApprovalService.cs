using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentApprovalService
    {
        Task<List<RecruitmentApproval>> GetByApproverIdAsync(string approverId);
        Task<List<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId);
        Task<List<RecruitmentApproval>> GetByRecruitmentRequestIdAsync(string recruitmentRequestId);
        Task<RecruitmentApproval?> GetAsync(string requestId, string approverId, int flowId);
        Task AddAsync(RecruitmentApproval approval, IEnumerable<ApprovalFlowEmployee> approvalFlows);
        Task AddAsync(RecruitmentApproval approval);
        Task UpdateAsync(RecruitmentApproval approval);
    }

    public class RecruitmentApprovalService : IRecruitmentApprovalService
    {
        private readonly IRecruitmentApprovalRepository _repository;

        public RecruitmentApprovalService(IRecruitmentApprovalRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public async Task<List<RecruitmentApproval>> GetByApproverIdAsync(string approverId)
        {
            return await _repository.GetByApproverIdAsync(approverId);
        }

        public async Task<List<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId)
        {
            return await _repository.GetByStatusAndApproverIdAsync(status, approverId);
        }

        public async Task<List<RecruitmentApproval>> GetByRecruitmentRequestIdAsync(string recruitmentRequestId)
        {
            return await _repository.GetByRecruitmentRequestIdAsync(recruitmentRequestId);
        }

        public async Task<RecruitmentApproval?> GetAsync(string requestId, string approverId, int flowId)
        {
            return await _repository.GetAsync(requestId, approverId, flowId);
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

            await _repository.AddAsync(approval, approvalFlows);
            await _repository.SaveChangesAsync();
        }

        public async Task AddAsync(RecruitmentApproval approval)
        {
            if (approval == null)
            {
                throw new ArgumentNullException(nameof(approval));
            }

            await _repository.AddAsync(approval);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(RecruitmentApproval approval)
        {
            if (approval == null)
            {
                throw new ArgumentNullException(nameof(approval));
            }

            await _repository.UpdateAsync(approval);
            await _repository.SaveChangesAsync();
        }
    }
}