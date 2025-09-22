using MyApp.Api.Entities.jobs;
using MyApp.Api.Models.dto.jobs;
using MyApp.Api.Repositories.jobs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.jobs
{
    public interface IJobOfferService
    {
        Task<(IEnumerable<JobOffer>, int)> GetAllByCriteriaAsync(JobOfferSearchDTO criteria, int page, int pageSize);
        Task<IEnumerable<JobOffer>> GetAllAsync();
        Task<JobOffer?> GetByIdAsync(string id);
        Task<string> CreateAsync(JobOfferDTOForm dtoOffer, JobDescriptionDTO dtoDescription);
        Task<JobOffer?> UpdateAsync(string id, JobOfferDTOForm dto);
        Task<bool> DeleteAsync(string id);
        Task<JobOfferStats> GetStatisticsAsync();

        Task<IEnumerable<JobOffer>> GetLastThreeNonClosedAsync();
    }

    public class JobOfferService : IJobOfferService
    {
        private readonly IJobOfferRepository _repository;
        private readonly IJobDescriptionRepository _repositoryDescription;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<JobOfferService> _logger;

        public JobOfferService(
            IJobOfferRepository repository,
            IJobDescriptionRepository repositoryDescription,
            ISequenceGenerator sequenceGenerator,
            ILogger<JobOfferService> logger)
        {
            _repository = repository;
            _repositoryDescription = repositoryDescription;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }


        public async Task<IEnumerable<JobOffer>> GetLastThreeNonClosedAsync()
        {
            try
            {
                return await _repository.GetLastThreeNonClosedAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des 3 dernières offres non clôturées");
                throw;
            }
        }

        public async Task<JobOfferStats> GetStatisticsAsync()
        {
            try
            {
                return await _repository.GetStatisticsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statistiques des offres d'emploie");
                throw;
            }
        }

        public async Task<(IEnumerable<JobOffer>, int)> GetAllByCriteriaAsync(JobOfferSearchDTO criteria, int page, int pageSize)
        {
            try
            {
                var (jobOffers, totalCount) = await _repository.GetAllByCriteriaAsync(criteria, page, pageSize);
                return (jobOffers, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des offres avec critères pour page {Page} et pageSize {PageSize}", page, pageSize);
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

        public async Task<string> CreateAsync(JobOfferDTOForm dtoOffer, JobDescriptionDTO dtoDescription)
        {
            try
            {
                using var transaction = await _repository.BeginTransactionAsync();
                try
                {
                    var jobDescriptionId = _sequenceGenerator.GenerateSequence("seq_job_description_id", "JOB", 6, "-");
                    var jobDescription = new JobDescription(dtoDescription)
                    {
                        DescriptionId = jobDescriptionId
                    };

                    var jobOfferId = _sequenceGenerator.GenerateSequence("seq_job_offer_id", "JOF", 6, "-");

                    var jobOffer = new JobOffer(dtoOffer)
                    {
                        OfferId = jobOfferId,
                        DescriptionId = jobDescriptionId
                    };

                    await _repositoryDescription.AddAsync(jobDescription);
                    await _repositoryDescription.SaveChangesAsync();
                    await _repository.AddAsync(jobOffer);
                    await _repository.SaveChangesAsync();

                    await transaction.CommitAsync();

                    return jobOffer.OfferId;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "Erreur lors de la création d'une offre d'emploi, transaction annulée");
                    throw;
                }
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