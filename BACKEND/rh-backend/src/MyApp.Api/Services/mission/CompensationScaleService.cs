using MyApp.Api.Entities.mission;
using MyApp.Api.Models.form.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    public interface ICompensationScaleService
    {
        Task<IEnumerable<CompensationScale>> GetAllAsync();
        Task<CompensationScale?> GetByIdAsync(string id);
        Task<IEnumerable<CompensationScale>> GetByEmployeeCategoryAsync(string categoryId);
        Task<IEnumerable<CompensationScale>> GetByCriteriaAsync(CompensationScaleDTOForm criteria);
        Task<string> CreateAsync(CompensationScale scale);
        Task<bool> UpdateAsync(CompensationScale scale);
        Task<bool> DeleteAsync(string id);
    }

    public class CompensationScaleService : ICompensationScaleService
    {
        private readonly ICompensationScaleRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<CompensationScale> _logger;

        public CompensationScaleService(ICompensationScaleRepository repository, ISequenceGenerator sequenceGenerator, ILogger<CompensationScale> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<CompensationScale>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<CompensationScale?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<CompensationScale>> GetByEmployeeCategoryAsync(string categoryId)
        {
            return await _repository.GetByEmployeeCategoryAsync(categoryId);
        }

        public async Task<IEnumerable<CompensationScale>> GetByCriteriaAsync(CompensationScaleDTOForm criteria)
        {
            return await _repository.GetByCriteriaAsync(criteria);
        }

        public async Task<string> CreateAsync(CompensationScale scale)
        {
            if (string.IsNullOrWhiteSpace(scale.CompensationScaleId))
            {
                scale.CompensationScaleId = _sequenceGenerator.GenerateSequence("seq_compensation_scale", "CMP", 6, "-");
            }

            scale.CreatedAt = DateTime.UtcNow;
            scale.UpdatedAt = DateTime.UtcNow;

            await _repository.AddAsync(scale);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Grille de compensation créée : {CompensationScaleId}", scale.CompensationScaleId);
            return scale.CompensationScaleId;
        }

        public async Task<bool> UpdateAsync(CompensationScale scale)
        {
            var existing = await _repository.GetByIdAsync(scale.CompensationScaleId);
            if (existing == null) return false;

            existing.Amount = scale.Amount;
            existing.TransportId = scale.TransportId;
            existing.ExpenseTypeId = scale.ExpenseTypeId;
            existing.EmployeeCategoryId = scale.EmployeeCategoryId;
            existing.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(existing);
            await _repository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return false;

            await _repository.DeleteAsync(existing);
            await _repository.SaveChangesAsync();
            return true;
        }
    }
}
