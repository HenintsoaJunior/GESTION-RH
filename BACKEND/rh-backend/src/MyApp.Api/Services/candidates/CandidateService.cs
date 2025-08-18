using MyApp.Api.Repositories.candidates;
using YourAppNamespace.Entities;

namespace MyApp.Api.Services.candidates
{
    public interface ICandidateService
    {
        Task<IEnumerable<Candidate>> GetAllByCriteriaAsync(Candidate criteria);
        Task<IEnumerable<Candidate>> GetAllAsync();
        Task<Candidate?> GetByIdAsync(string id);
        Task AddAsync(Candidate candidate);
        Task UpdateAsync(Candidate candidate);
        Task DeleteAsync(Candidate candidate);
    }

    public class CandidateService : ICandidateService
    {
        private readonly ICandidateRepository _repository;

        public CandidateService(ICandidateRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Candidate>> GetAllByCriteriaAsync(Candidate criteria)
        {
            return await _repository.GetAllByCriteriaAsync(criteria);
        }

        public async Task<IEnumerable<Candidate>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<Candidate?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(Candidate candidate)
        {
            await _repository.AddAsync(candidate);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(Candidate candidate)
        {
            await _repository.UpdateAsync(candidate);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(Candidate candidate)
        {
            await _repository.DeleteAsync(candidate);
            await _repository.SaveChangesAsync();
        }
    }
}
