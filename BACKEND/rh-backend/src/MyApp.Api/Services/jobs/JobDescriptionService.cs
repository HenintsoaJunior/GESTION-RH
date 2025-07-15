using MyApp.Api.Entities.jobs;
using MyApp.Api.Repositories.jobs;

namespace MyApp.Api.Services.jobs
{
    public interface IJobDescriptionService
    {
        Task<IEnumerable<JobDescription>> GetAllAsync();
        Task<JobDescription?> GetByIdAsync(string id);
        Task<IEnumerable<JobDescription>> GetBySiteAsync(string siteId);
        Task AddAsync(JobDescription jobDescription);
        Task UpdateAsync(JobDescription jobDescription);
        Task DeleteAsync(JobDescription jobDescription);
    }
    public class JobDescriptionService : IJobDescriptionService
    {
        private readonly IJobDescriptionRepository _repository;

        public JobDescriptionService(IJobDescriptionRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<JobDescription>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<JobDescription?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<JobDescription>> GetBySiteAsync(string siteId)
        {
            return await _repository.GetBySiteAsync(siteId);
        }

        public async Task AddAsync(JobDescription jobDescription)
        {
            await _repository.AddAsync(jobDescription);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(JobDescription jobDescription)
        {
            await _repository.UpdateAsync(jobDescription);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(JobDescription jobDescription)
        {
            await _repository.DeleteAsync(jobDescription);
            await _repository.SaveChangesAsync();
        }
    }
}
