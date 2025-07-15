using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentReasonService
    {
        Task<IEnumerable<RecruitmentReason>> GetAllAsync();
        Task<RecruitmentReason?> GetByIdAsync(string id);
        Task AddAsync(RecruitmentReason reason);
        Task UpdateAsync(RecruitmentReason reason);
        Task DeleteAsync(string id);
    }

    public class RecruitmentReasonService : IRecruitmentReasonService
    {
        private readonly IRecruitmentReasonRepository _repository;

        public RecruitmentReasonService(IRecruitmentReasonRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<RecruitmentReason>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<RecruitmentReason?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(RecruitmentReason reason)
        {
            await _repository.AddAsync(reason);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(RecruitmentReason reason)
        {
            await _repository.UpdateAsync(reason);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
