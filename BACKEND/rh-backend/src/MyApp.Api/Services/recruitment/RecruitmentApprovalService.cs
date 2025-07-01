using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentApprovalService
    {
        Task<IEnumerable<RecruitmentApproval>> GetRecommendedApprovalsByRequesterAsync(string requesterId);
        Task<IEnumerable<RecruitmentApproval>> GetValidatedApprovalsByApproverAsync(string approverId);
        Task<IEnumerable<RecruitmentApproval>> GetApprovalsByRequestIdAsync(string requestId);
        Task<IEnumerable<RecruitmentApproval>> GetByApproverAsync(string approverId);
        Task ValidateApprovalAsync(RecruitmentApproval approval);
        Task RecommendApprovalAsync(RecruitmentApproval approval);
    }

    // RecruitmentApprovalService.cs
    public class RecruitmentApprovalService : IRecruitmentApprovalService
    {
        private readonly IRecruitmentApprovalRepository _repository;

        public RecruitmentApprovalService(IRecruitmentApprovalRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<RecruitmentApproval>> GetRecommendedApprovalsByRequesterAsync(string requesterId)
        {
            return await _repository.GetRecommendedApprovalsByRequesterAsync(requesterId);
        }
        public async Task<IEnumerable<RecruitmentApproval>> GetValidatedApprovalsByApproverAsync(string approverId)
        {
            return await _repository.GetValidatedByApproverAsync(approverId);
        }


        public async Task<IEnumerable<RecruitmentApproval>> GetApprovalsByRequestIdAsync(string requestId)
        {
            return await _repository.GetByRequestIdAsync(requestId);
        }

        public async Task<IEnumerable<RecruitmentApproval>> GetByApproverAsync(string approverId)
        {
            return await _repository.GetByApproverAsync(approverId);
        }

        public async Task ValidateApprovalAsync(RecruitmentApproval approval)
        {
            var existing = await _repository.GetAsync(approval.ApproverId, approval.RecruitmentRequestId);

            if (existing == null)
            {
                approval.Status = approval.Status ?? "Validé";
                approval.ApprovalDate = approval.ApprovalDate ?? DateTime.Now;
                await _repository.AddAsync(approval);
            }
            else
            {
                existing.Status = approval.Status ?? "Validé";
                existing.ApprovalDate = approval.ApprovalDate ?? DateTime.Now;
                existing.Comments = approval.Comments;
                existing.Signature = approval.Signature;
                await _repository.UpdateAsync(existing);
            }

            await _repository.SaveChangesAsync();
        }

        public async Task RecommendApprovalAsync(RecruitmentApproval approval)
        {
            var existing = await _repository.GetAsync(approval.ApproverId, approval.RecruitmentRequestId);

            if (existing == null)
            {
                approval.Status = "Recommandé";
                await _repository.AddAsync(approval);
            }
            else
            {
                existing.Comments = approval.Comments;
                existing.Status = "Recommandé";
                existing.Signature = approval.Signature;
                await _repository.UpdateAsync(existing);
            }

            await _repository.SaveChangesAsync();
        }
    }
}