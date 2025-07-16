using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentApprovalService
    {
        Task<IEnumerable<RecruitmentApproval>> GetByApprovalFlowAsync(string flowId);
        Task<IEnumerable<RecruitmentApproval>> GetByApproverIdAsync(string approverId);
        Task<IEnumerable<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId);
        Task AddAsync(RecruitmentApproval approval, IEnumerable<ApprovalFlow> approvalFlows);
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

        public async Task<IEnumerable<RecruitmentApproval>> GetByApprovalFlowAsync(string flowId)
        {
            return await _repository.GetByApprovalFlowAsync(flowId);
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

        public async Task AddAsync(RecruitmentApproval approval, IEnumerable<ApprovalFlow> approvalFlows)
        {
            await _repository.AddAsync(approval, approvalFlows);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(RecruitmentApproval approval)
        {
            await _repository.UpdateAsync(approval);
            await _repository.SaveChangesAsync();
        }
    }
}
