using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestDetailService
    {
        Task<IEnumerable<RecruitmentRequestDetail>> GetAllAsync();
        Task<RecruitmentRequestDetail?> GetByIdAsync(string id);
        Task<IEnumerable<RecruitmentRequestDetail>> GetByRequestIdAsync(string recruitmentRequestId);
        Task AddAsync(RecruitmentRequestDetail detail);
        Task UpdateAsync(RecruitmentRequestDetail detail);
        Task DeleteAsync(string id);
    }

    public class RecruitmentRequestDetailService : IRecruitmentRequestDetailService
    {
        private readonly IRecruitmentRequestDetailRepository _repository;

        public RecruitmentRequestDetailService(IRecruitmentRequestDetailRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<RecruitmentRequestDetail>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<RecruitmentRequestDetail?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<RecruitmentRequestDetail>> GetByRequestIdAsync(string recruitmentRequestId)
        {
            return await _repository.GetByRequestIdAsync(recruitmentRequestId);
        }

        public async Task AddAsync(RecruitmentRequestDetail detail)
        {
            await _repository.AddAsync(detail);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(RecruitmentRequestDetail detail)
        {
            await _repository.UpdateAsync(detail);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
