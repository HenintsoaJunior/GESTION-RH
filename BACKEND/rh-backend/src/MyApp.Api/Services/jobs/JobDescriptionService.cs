using MyApp.Api.Entities.jobs;
using MyApp.Api.Repositories.jobs;
using MyApp.Api.Utils.generator;
using MyApp.Model.form.Jobs;

namespace MyApp.Api.Services.jobs
{
    public interface IJobDescriptionService
    {
        Task<IEnumerable<JobDescription>> GetAllByCriteriaAsync(JobDescriptionDTOForm criteria);
        Task<IEnumerable<JobDescription>> GetAllAsync();
        Task<JobDescription?> GetByIdAsync(string id);
        Task<string> CreateAsync(JobDescriptionDTOForm dto);
        Task<JobDescription?> UpdateAsync(string id, JobDescriptionDTOForm dto);
        Task<bool> DeleteAsync(string id);
    }

    public class JobDescriptionService : IJobDescriptionService
    {
        private readonly IJobDescriptionRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<JobDescriptionService> _logger;

        public JobDescriptionService(
            IJobDescriptionRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<JobDescriptionService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<JobDescription>> GetAllByCriteriaAsync(JobDescriptionDTOForm criteria)
        {
            try
            {
                var search = new JobDescription(criteria);
                return await _repository.GetAllByCriteriaAsync(search);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des JobDescriptions par critères");
                throw;
            }
        }

        public async Task<IEnumerable<JobDescription>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les JobDescriptions");
                throw;
            }
        }

        public async Task<JobDescription?> GetByIdAsync(string id)
        {
            try
            {
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la JobDescription {JobDescriptionId}", id);
                throw;
            }
        }

        public async Task<string> CreateAsync(JobDescriptionDTOForm dto)
        {
            try
            {
                var jobDescription = new JobDescription(dto);
                if (string.IsNullOrWhiteSpace(jobDescription.DescriptionId))
                    jobDescription.DescriptionId = _sequenceGenerator.GenerateSequence("seq_job_description_id", "JOB", 6, "-");

                await _repository.AddAsync(jobDescription);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("JobDescription créé avec l'ID: {JobDescriptionId}", jobDescription.DescriptionId);

                return jobDescription.DescriptionId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création d'une JobDescription");
                throw;
            }
        }

        public async Task<JobDescription?> UpdateAsync(string id, JobDescriptionDTOForm dto)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null) return null;

                existing = new JobDescription(dto);

                await _repository.UpdateAsync(existing);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("JobDescription {JobDescriptionId} mis à jour avec succès", id);

                return existing;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la JobDescription {JobDescriptionId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string id)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return false;

                await _repository.DeleteAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("JobDescription {JobDescriptionId} supprimé avec succès", id);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la JobDescription {JobDescriptionId}", id);
                throw;
            }
        }
    }
}
