using MyApp.Api.Entities.candidates;
using MyApp.Api.Models.dto.candidates;
using MyApp.Api.Repositories.candidates;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.candidates
{
    public interface ICvDetailService
    {
        Task<IEnumerable<CvDetail>> GetAllAsync();
        Task<CvDetail?> GetByIdAsync(string id);
        Task<IEnumerable<CvDetail>> GetByApplicationIdAsync(string applicationId);
        Task<string> CreateAsync(CvDetailDTOForm dto);
        Task<CvDetail?> UpdateAsync(string id, CvDetailDTOForm dto);
        Task<bool> DeleteAsync(string id);
    }

    public class CvDetailService : ICvDetailService
    {
        private readonly ICvDetailRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<CvDetailService> _logger;

        public CvDetailService(
            ICvDetailRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<CvDetailService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<CvDetail>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les CV details");
                throw;
            }
        }

        public async Task<CvDetail?> GetByIdAsync(string id)
        {
            try
            {
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du CV detail {CvDetailId}", id);
                throw;
            }
        }

        public async Task<IEnumerable<CvDetail>> GetByApplicationIdAsync(string applicationId)
        {
            try
            {
                return await _repository.GetByApplicationIdAsync(applicationId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des CV details pour l'application {ApplicationId}", applicationId);
                throw;
            }
        }

        public async Task<string> CreateAsync(CvDetailDTOForm dto)
        {
            try
            {
                var entity = new CvDetail(dto);
                if (string.IsNullOrWhiteSpace(entity.CvDetailId))
                {
                    entity.CvDetailId = _sequenceGenerator.GenerateSequence("seq_cv_detail_id", "CVD", 6, "-");
                }

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("CV detail {CvDetailId} créé", entity.CvDetailId);

                return entity.CvDetailId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création d'un CV detail");
                throw;
            }
        }

        public async Task<CvDetail?> UpdateAsync(string id, CvDetailDTOForm dto)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return null;

                entity = new CvDetail(dto) { CvDetailId = id };

                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("CV detail {CvDetailId} mis à jour", id);

                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du CV detail {CvDetailId}", id);
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

                _logger.LogInformation("CV detail {CvDetailId} supprimé", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du CV detail {CvDetailId}", id);
                throw;
            }
        }
    }
}
