using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestDetailService
    {
        Task<IEnumerable<RecruitmentRequestDetail>> GetAllAsync();
        Task<RecruitmentRequestDetail?> GetByIdAsync(string id);
        Task<IEnumerable<RecruitmentRequestDetail>> GetByRequestIdAsync(string recruitmentRequestId);
        Task AddAsync(RecruitmentRequestDetail detail);
        Task UpdateAsync(RecruitmentRequestDetail detail);
        Task DeleteAsync(string id);
    }

    public class RecruitmentRequestDetailService : IRecruitmentRequestDetailService
    {
        private readonly IRecruitmentRequestDetailRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<RecruitmentRequestDetailService> _logger;

        public RecruitmentRequestDetailService(
            IRecruitmentRequestDetailRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<RecruitmentRequestDetailService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<IEnumerable<RecruitmentRequestDetail>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les détails de demande de recrutement");
                throw;
            }
        }

        public async Task<RecruitmentRequestDetail?> GetByIdAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un détail avec un ID null ou vide");
                    return null;
                }

                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du détail avec l'ID: {Id}", id);
                throw;
            }
        }

        public async Task<IEnumerable<RecruitmentRequestDetail>> GetByRequestIdAsync(string recruitmentRequestId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(recruitmentRequestId))
                {
                    _logger.LogWarning("Tentative de récupération des détails avec un ID de demande null ou vide");
                    return Enumerable.Empty<RecruitmentRequestDetail>();
                }

                return await _repository.GetByRequestIdAsync(recruitmentRequestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des détails pour la demande: {RequestId}", recruitmentRequestId);
                throw;
            }
        }

        public async Task AddAsync(RecruitmentRequestDetail detail)
        {
            try
            {
                if (detail == null)
                {
                    throw new ArgumentNullException(nameof(detail), "Le détail de demande de recrutement ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(detail.RecruitmentRequestDetailId))
                {
                    detail.RecruitmentRequestDetailId = _sequenceGenerator.GenerateSequence("seq_recruitment_request_detail_id", "REQDET", 6, "-");
                }

                if (string.IsNullOrEmpty(detail.RecruitmentRequestDetailId))
                {
                    _logger.LogError("Échec de la génération de RecruitmentRequestDetailId");
                    throw new InvalidOperationException("RecruitmentRequestDetailId ne peut pas être null.");
                }

                await _repository.AddAsync(detail);
                await _repository.SaveChangesAsync();
                
                _logger.LogInformation("Détail de demande de recrutement ajouté avec succès avec l'ID: {DetailId}", detail.RecruitmentRequestDetailId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout du détail de demande de recrutement");
                throw;
            }
        }

        public async Task UpdateAsync(RecruitmentRequestDetail detail)
        {
            try
            {
                if (detail == null)
                {
                    throw new ArgumentNullException(nameof(detail), "Le détail de demande de recrutement ne peut pas être null");
                }

                await _repository.UpdateAsync(detail);
                await _repository.SaveChangesAsync();
                
                _logger.LogInformation("Détail de demande de recrutement mis à jour avec succès pour l'ID: {DetailId}", detail.RecruitmentRequestDetailId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du détail de demande de recrutement avec l'ID: {DetailId}", detail?.RecruitmentRequestDetailId);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID du détail ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();
                
                _logger.LogInformation("Détail de demande de recrutement supprimé avec succès pour l'ID: {DetailId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du détail de demande de recrutement avec l'ID: {DetailId}", id);
                throw;
            }
        }
    }
}