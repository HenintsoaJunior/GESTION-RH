using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentApprovalService
    {
        // valider la demande
        Task ValidateAsync(string requestId, string approverId);
        //  recommander la demande 
        Task RecommendAsync(string requestId, string approverId, string comment);
        Task<IEnumerable<RecruitmentApproval>> GetByApproverIdAsync(string approverId);
        // prendre les demandes en attente et celles validés
        Task<IEnumerable<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId);
        Task AddAsync(string recruitmentRequestId, IEnumerable<ApprovalFlowEmployee> approvalFlows);
        Task AddAsync(RecruitmentApproval approval);
        
        Task UpdateAsync(RecruitmentApproval approval);
        Task<RecruitmentApproval?> GetAsync(string requestId, string approverId, string flowId);
    }

    public class RecruitmentApprovalService : IRecruitmentApprovalService
    {
        private readonly IRecruitmentApprovalRepository _repository;

        public RecruitmentApprovalService(IRecruitmentApprovalRepository repository)
        {
            _repository = repository;
        }

        public async Task ValidateAsync(string requestId, string approverId)
        {
            await _repository.ValidateAsync(requestId, approverId);
        }

        public async Task RecommendAsync(string requestId, string approverId, string comment)
        {
            await _repository.RecommendAsync(requestId, approverId, comment);
        }

        public async Task<IEnumerable<RecruitmentApproval>> GetByApproverIdAsync(string approverId)
        {
            return await _repository.GetByApproverIdAsync(approverId);
        }

        public async Task<IEnumerable<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId)
        {
            return await _repository.GetByStatusAndApproverIdAsync(status, approverId);
        }

        public async Task<RecruitmentApproval?> GetAsync(string requestId, string approverId, string flowId)
        {
            return await _repository.GetAsync(requestId, approverId, flowId);
        }

        public async Task AddAsync(string recruitmentRequestId, IEnumerable<ApprovalFlowEmployee> approvalFlows)
        {
            IEnumerable<RecruitmentApproval> recruitmentApprovals = RecruitmentApproval.GetRecruitmentApprovalsFromApprovalFlows(recruitmentRequestId,approvalFlows);
            await _repository.AddRangeAsync(recruitmentApprovals);
            await _repository.SaveChangesAsync();
        }

        public async Task AddAsync(RecruitmentApproval approval)
        {
            await _repository.AddAsync(approval);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(RecruitmentApproval approval)
        {
            await _repository.UpdateAsync(approval);
            await _repository.SaveChangesAsync();
        }
    }
}
