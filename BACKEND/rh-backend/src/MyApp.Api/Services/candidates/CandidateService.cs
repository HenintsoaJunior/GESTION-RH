using MyApp.Api.Entities.candidates;
using MyApp.Api.Models.form.candidates;
using MyApp.Api.Repositories.candidates;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.candidates
{
    public interface ICandidateService
    {
        Task<IEnumerable<Candidate>> GetAllByCriteriaAsync(CandidateDTOForm criteria);
        Task<IEnumerable<Candidate>> GetAllAsync();
        Task<Candidate?> GetByIdAsync(string id);
        Task<string> CreateAsync(CandidateDTOForm candidateDto);
        Task<bool> UpdateAsync(string id, CandidateDTOForm candidateDto);
        Task<bool> DeleteAsync(string id);
    }

    public class CandidateService : ICandidateService
    {
        private readonly ICandidateRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<CandidateService> _logger;

        public CandidateService(
            ICandidateRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<CandidateService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<Candidate>> GetAllByCriteriaAsync(CandidateDTOForm criteria)
        {
            try
            {
                var search = new Candidate(criteria);
                return await _repository.GetAllByCriteriaAsync(search);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des candidats par critères");
                throw;
            }
        }

        public async Task<IEnumerable<Candidate>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les candidats");
                throw;
            }
        }

        public async Task<Candidate?> GetByIdAsync(string id)
        {
            try
            {
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du candidat {CandidateId}", id);
                throw;
            }
        }

        public async Task<string> CreateAsync(CandidateDTOForm candidateDto)
        {
            try
            {
                var candidate = new Candidate(candidateDto);

                if (string.IsNullOrWhiteSpace(candidate.CandidateId))
                {
                    candidate.CandidateId = _sequenceGenerator.GenerateSequence("seq_candidate_id", "CND", 6, "-");
                }

                await _repository.AddAsync(candidate);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Candidat créé avec l'ID: {CandidateId}", candidate.CandidateId);
                return candidate.CandidateId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du candidat");
                throw;
            }
        }

        public async Task<bool> UpdateAsync(string id, CandidateDTOForm candidateDto)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return false;

                entity = new Candidate(candidateDto);

                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Candidat mis à jour avec l'ID: {CandidateId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du candidat {CandidateId}", id);
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

                _logger.LogInformation("Candidat supprimé avec l'ID: {CandidateId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du candidat {CandidateId}", id);
                throw;
            }
        }
    }
}
