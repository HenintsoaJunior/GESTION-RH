using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestReplacementReasonService
    {
        Task<IEnumerable<RecruitmentRequestReplacementReason>> GetAllAsync();
        Task<IEnumerable<RecruitmentRequestReplacementReason>> GetByRequestIdAsync(string requestId);
        Task AddAsync(RecruitmentRequestReplacementReason entity);
        Task DeleteAsync(string requestId, string reasonId);
    }

    public class RecruitmentRequestReplacementReasonService : IRecruitmentRequestReplacementReasonService
    {
        private readonly IRecruitmentRequestReplacementReasonRepository _repository;

        public RecruitmentRequestReplacementReasonService(IRecruitmentRequestReplacementReasonRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<RecruitmentRequestReplacementReason>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<IEnumerable<RecruitmentRequestReplacementReason>> GetByRequestIdAsync(string requestId)
        {
            return await _repository.GetByRequestIdAsync(requestId);
        }

        public async Task AddAsync(RecruitmentRequestReplacementReason entity)
        {
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string requestId)
        {
            await _repository.DeleteAsync(requestId);
            await _repository.SaveChangesAsync();
        }

        public Task DeleteAsync(string requestId, string reasonId)
        {
            throw new NotImplementedException();
        }
    }
}
