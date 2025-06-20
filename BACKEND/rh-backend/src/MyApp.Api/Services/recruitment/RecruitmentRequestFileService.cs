using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestFileService
    {
        Task<IEnumerable<RecruitmentRequestFile>> GetAllFilesAsync();
        Task<RecruitmentRequestFile?> GetFileByIdAsync(string id);
        Task AddFileAsync(RecruitmentRequestFile file);
    }

    public class RecruitmentRequestFileService : IRecruitmentRequestFileService
    {
        private readonly IRecruitmentRequestFileRepository _repository;

        public RecruitmentRequestFileService(IRecruitmentRequestFileRepository repository)
        {
            _repository = repository;
        }
        public async Task<IEnumerable<RecruitmentRequestFile>> GetAllFilesAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<RecruitmentRequestFile?> GetFileByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddFileAsync(RecruitmentRequestFile file)
        {
            await _repository.AddAsync(file);
            await _repository.SaveChangesAsync();
        }
    }
}