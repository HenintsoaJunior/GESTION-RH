using MyApp.Api.Entities.jobs;
using MyApp.Api.Repositories.jobs;
namespace MyApp.Api.Services.jobs
{
    public interface IJobOfferService
    {
         Task<IEnumerable<JobOffer>> GetAllByCriteriaAsync(JobOffer criteria);
        Task<IEnumerable<JobOffer>> GetAllAsync();
        Task<JobOffer?> GetByIdAsync(string id);
        Task AddAsync(JobOffer offer);
        Task UpdateAsync(JobOffer offer);
        Task DeleteAsync(JobOffer offer);
    }
    public class JobOfferService : IJobOfferService
    {
        private readonly IJobOfferRepository _repository;

        public JobOfferService(IJobOfferRepository repository)
        {
            _repository = repository;
        }

         public async Task<IEnumerable<JobOffer>> GetAllByCriteriaAsync(JobOffer criteria)
        {
            return await _repository.GetAllByCriteriaAsync(criteria);
        }

        public async Task<IEnumerable<JobOffer>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<JobOffer?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }


        public async Task AddAsync(JobOffer offer)
        {
            await _repository.AddAsync(offer);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(JobOffer offer)
        {
            await _repository.UpdateAsync(offer);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(JobOffer offer)
        {
            await _repository.DeleteAsync(offer);
            await _repository.SaveChangesAsync();
        }
    }
}

