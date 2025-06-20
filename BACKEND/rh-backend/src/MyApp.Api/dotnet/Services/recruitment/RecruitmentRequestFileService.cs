using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestFileService
    {
        Task UploadFileAsync(RecruitmentRequestFile file);
        Task<IEnumerable<RecruitmentRequestFile>> GetFilesByRequestIdAsync(string requestId);
    }
    public class RecruitmentRequestFileService : IRecruitmentRequestFileService
    {
        private readonly IRecruitmentRequestFileRepository _repository;

        public RecruitmentRequestFileService(IRecruitmentRequestFileRepository repository)
        {
            _repository = repository;
        }

        public async Task UploadFileAsync(RecruitmentRequestFile file)
        {
            await _repository.AddAsync(file);
            await _repository.SaveChangesAsync();
        }

        public async Task<IEnumerable<RecruitmentRequestFile>> GetFilesByRequestIdAsync(string requestId)
        {
            return await _repository.GetByRequestIdAsync(requestId);
        }
    }
}
