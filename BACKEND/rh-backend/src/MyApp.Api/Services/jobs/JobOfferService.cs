using MyApp.Api.Entities.jobs;
using MyApp.Api.Models.dto.jobs;
using MyApp.Api.Repositories.jobs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.jobs
{
    public interface IJobOfferService
    {
        Task<IEnumerable<JobOffer>> GetAllByCriteriaAsync(JobOfferDTOForm criteria);
        Task<IEnumerable<JobOffer>> GetAllAsync();
        Task<JobOffer?> GetByIdAsync(string id);
        Task<string> CreateAsync(JobOfferDTOForm dto);
        Task<JobOffer?> UpdateAsync(string id, JobOfferDTOForm dto);
        Task<bool> DeleteAsync(string id);
    }

    public class JobOfferService : IJobOfferService
    {
        private readonly IJobOfferRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<JobOfferService> _logger;

        public JobOfferService(
            IJobOfferRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<JobOfferService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<JobOffer>> GetAllByCriteriaAsync(JobOfferDTOForm criteria)
        {
            try
            {
                var search = new JobOffer(criteria);
                return await _repository.GetAllByCriteriaAsync(search);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des offres avec critères");
                throw;
            }
        }

        public async Task<IEnumerable<JobOffer>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les offres");
                throw;
            }
        }

        public async Task<JobOffer?> GetByIdAsync(string id)
        {
            try
            {
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'offre {JobOfferId}", id);
                throw;
            }
        }

        public async Task<string> CreateAsync(JobOfferDTOForm dto)
        {
            try
            {
                var jobOffer = new JobOffer(dto);

                if (string.IsNullOrWhiteSpace(jobOffer.OfferId))
                {
                    jobOffer.OfferId = _sequenceGenerator.GenerateSequence("seq_job_offer_id", "JOF", 6, "-");
                }

                await _repository.AddAsync(jobOffer);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("JobOffer créé avec l'ID: {JobOfferId}", jobOffer.OfferId);

                return jobOffer.OfferId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création d'une offre d'emploi");
                throw;
            }
        }

        public async Task<JobOffer?> UpdateAsync(string id, JobOfferDTOForm dto)
        {
            try
            {
                var existing = await _repository.GetByIdAsync(id);
                if (existing == null) return null;

                // Re-crée l’objet avec le DTO mais garde l’ID existant
                var updated = new JobOffer(dto)
                {
                    OfferId = existing.OfferId
                };

                await _repository.UpdateAsync(updated);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("JobOffer {JobOfferId} mis à jour avec succès", id);

                return updated;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'offre {JobOfferId}", id);
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

                _logger.LogInformation("JobOffer {JobOfferId} supprimé avec succès", id);

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'offre {JobOfferId}", id);
                throw;
            }
        }
    }
}
