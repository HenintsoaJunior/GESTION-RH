using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestService
    {
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
        private readonly IRecruitmentRequestRepository _repository;

        public RecruitmentRequestService(IRecruitmentRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<RecruitmentRequest?> GetByRequestIdAsync(string requestId)
        {
            return await _repository.GetByRequestIdAsync(requestId);
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAsync(string requesterId)
        {
            return await _repository.GetByRequesterIdAsync(requesterId);
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAndValidatedAsync(string requesterId)
        {
            return await _repository.GetByRequesterIdAndValidatedAsync(requesterId);
        }

        public async Task AddAsync(RecruitmentRequest request)
        {
            await _repository.AddAsync(request);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(RecruitmentRequest request)
        {
            await _repository.UpdateAsync(request);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string requestId)
        {
            await _repository.DeleteAsync(requestId);
            await _repository.SaveChangesAsync();
        }
    }
}
