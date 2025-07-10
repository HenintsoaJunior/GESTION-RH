using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestService
    {
        Task<IEnumerable<RecruitmentRequest>> GetByCriteriaAsync(RecruitmentRequestCriteria criteria);
        Task<IEnumerable<RecruitmentRequest>> GetPaginatedRequestsAsync(int startIndex, int count, string? requesterId = null);
        Task<IEnumerable<RecruitmentRequest>> GetRequestsByRequesterAsync(string requesterId);
        Task<IEnumerable<RecruitmentRequest>> GetAllRequestsAsync();
        Task<RecruitmentRequest?> GetRequestByIdAsync(string id);
        Task AddRequestAsync(RecruitmentRequest request);
    }

    public class RecruitmentRequestService : IRecruitmentRequestService
    {
        private readonly IRecruitmentRequestRepository _repository;

        public RecruitmentRequestService(IRecruitmentRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByCriteriaAsync(RecruitmentRequestCriteria criteria)
        {
            criteria.Validate();
            return await _repository.GetByCriteriaAsync(criteria);
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetPaginatedRequestsAsync(int startIndex, int count, string? requesterId = null)
        {
            return await _repository.GetPaginatedAsync(startIndex, count, requesterId);
        }
        public async Task<IEnumerable<RecruitmentRequest>> GetRequestsByRequesterAsync(string requesterId)
        {
            return await _repository.GetByRequesterAsync(requesterId);
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetAllRequestsAsync()
        {
            return await _repository.GetAllAsync();
        }
        public async Task<RecruitmentRequest?> GetRequestByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }
        public async Task AddRequestAsync(RecruitmentRequest request)
        {
            await _repository.AddAsync(request);
            await _repository.SaveChangesAsync();
        }
    }
}
