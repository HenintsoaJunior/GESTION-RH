using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestFileService
    {
<<<<<<< HEAD
        Task<IEnumerable<RecruitmentRequestFile>> GetAllFilesAsync();
        Task<RecruitmentRequestFile?> GetFileByIdAsync(string id);
        Task AddFileAsync(RecruitmentRequestFile file);
    }

=======
        Task UploadFileAsync(RecruitmentRequestFile file);
        Task<IEnumerable<RecruitmentRequestFile>> GetFilesByRequestIdAsync(string requestId);
    }
>>>>>>> dev
    public class RecruitmentRequestFileService : IRecruitmentRequestFileService
    {
        private readonly IRecruitmentRequestFileRepository _repository;

        public RecruitmentRequestFileService(IRecruitmentRequestFileRepository repository)
        {
            _repository = repository;
        }
<<<<<<< HEAD
        public async Task<IEnumerable<RecruitmentRequestFile>> GetAllFilesAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<RecruitmentRequestFile?> GetFileByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddFileAsync(RecruitmentRequestFile file)
=======

        public async Task UploadFileAsync(RecruitmentRequestFile file)
>>>>>>> dev
        {
            await _repository.AddAsync(file);
            await _repository.SaveChangesAsync();
        }
<<<<<<< HEAD
    }
}
=======

        public async Task<IEnumerable<RecruitmentRequestFile>> GetFilesByRequestIdAsync(string requestId)
        {
            return await _repository.GetByRequestIdAsync(requestId);
        }
    }
}
>>>>>>> dev
