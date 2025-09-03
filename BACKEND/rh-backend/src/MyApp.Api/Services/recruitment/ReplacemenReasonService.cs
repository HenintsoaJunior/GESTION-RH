using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IReplacementReasonService
    {
        Task<IEnumerable<ReplacementReason>> GetAllAsync();
        Task<ReplacementReason?> GetByIdAsync(string id);
        Task AddAsync(ReplacementReason reason);
        Task UpdateAsync(ReplacementReason reason);
        Task DeleteAsync(string id);
    }

    public class ReplacementReasonService : IReplacementReasonService
    {
        private readonly IReplacementReasonRepository _repository;

        public ReplacementReasonService(IReplacementReasonRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ReplacementReason>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<ReplacementReason?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task AddAsync(ReplacementReason reason)
        {
            await _repository.AddAsync(reason);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(ReplacementReason reason)
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
