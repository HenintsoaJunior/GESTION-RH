using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.form.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestService
    {
        Task CreateRequest(RecruitmentRequest request, IEnumerable<ApprovalFlow> approvalFlows);
        Task<IEnumerable<RecruitmentRequest>> GetAllAsync();
        Task<RecruitmentRequest?> GetByRequestIdAsync(string requestId);
        Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAsync(string requesterId);
        Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAndValidatedAsync(string requesterId);
        Task AddAsync(RecruitmentRequest request);
        Task UpdateAsync(RecruitmentRequest request);
        Task DeleteAsync(string requestId);
    }

    public class RecruitmentRequestService : IRecruitmentRequestService
    {
        private readonly IRecruitmentRequestRepository _requestRepository;
        private readonly IRecruitmentRequestDetailRepository _requestDetailRepository;
        private readonly IRecruitmentApprovalRepository _approvalRepository;
        private readonly IRecruitmentRequestReplacementReasonRepository _replacementReasonRepository;

        public RecruitmentRequestService(IRecruitmentRequestRepository requestRepository, IRecruitmentRequestDetailRepository requestDetailRepository, IRecruitmentApprovalRepository approvalRepository, IRecruitmentRequestReplacementReasonRepository replacementReasonRepository)
        {
            _requestRepository = requestRepository;
            _requestDetailRepository = requestDetailRepository;
            _approvalRepository = approvalRepository;
            _replacementReasonRepository = replacementReasonRepository;
        }

        public async Task CreateRequest(RecruitmentRequest request, IEnumerable<ApprovalFlow> approvalFlows)
        {
            await AddAsync(request);
            string requestId = request.RecruitmentRequestId;

            // insertion dans recruitment_details
            RecruitmentRequestDetail detail = request.RecruitmentRequestDetail;
            detail.RecruitmentRequestId = requestId;
            await _requestDetailRepository.AddAsync(detail);
            await _requestDetailRepository.SaveChangesAsync();

            // insertion dans la table recruitment_approval
            RecruitmentApproval approval = request.RecruitmentApproval;
            approval.RecruitmentRequestId = requestId;
            await _approvalRepository.AddAsync(approval, approvalFlows);
            await _approvalRepository.SaveChangesAsync();

            // insertion dans la table recruitment_request_replacement_reason
            if (request.ReplacementReasons != null)
            {
                foreach (var reason in request.ReplacementReasons)
                {
                    reason.RecruitmentRequestId = requestId;
                }
                await _replacementReasonRepository.AddRangeAsync(request.ReplacementReasons);
                await _replacementReasonRepository.SaveChangesAsync();
            }
        }


        public async Task<IEnumerable<RecruitmentRequest>> GetAllAsync()
        {
            return await _requestRepository.GetAllAsync();
        }

        public async Task<RecruitmentRequest?> GetByRequestIdAsync(string requestId)
        {
            return await _requestRepository.GetByRequestIdAsync(requestId);
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAsync(string requesterId)
        {
            return await _requestRepository.GetByRequesterIdAsync(requesterId);
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAndValidatedAsync(string requesterId)
        {
            return await _requestRepository.GetByRequesterIdAndValidatedAsync(requesterId);
        }

        public async Task AddAsync(RecruitmentRequest request)
        {
            await _requestRepository.AddAsync(request);
            await _requestRepository.SaveChangesAsync();
        }

        public async Task UpdateAsync(RecruitmentRequest request)
        {
            await _requestRepository.UpdateAsync(request);
            await _requestRepository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string requestId)
        {
            await _requestRepository.DeleteAsync(requestId);
            await _requestRepository.SaveChangesAsync();
        }
    }
}
