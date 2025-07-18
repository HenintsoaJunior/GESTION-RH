using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestReplacementReasonService
    {
        Task<IEnumerable<RecruitmentRequestReplacementReason>> GetAllAsync();
        Task<IEnumerable<RecruitmentRequestReplacementReason>> GetByRequestIdAsync(string requestId);
        Task AddRangeAsync(IEnumerable<RecruitmentRequestReplacementReason> entities);
        Task AddAsync(RecruitmentRequestReplacementReason entity);
        Task DeleteAsync(string requestId);
        Task DeleteAsync(string requestId, string reasonId);
    }

    public class RecruitmentRequestReplacementReasonService : IRecruitmentRequestReplacementReasonService
    {
        private readonly IRecruitmentRequestReplacementReasonRepository _repository;
        private readonly ILogger<RecruitmentRequestReplacementReasonService> _logger;

        public RecruitmentRequestReplacementReasonService(
            IRecruitmentRequestReplacementReasonRepository repository,
            ILogger<RecruitmentRequestReplacementReasonService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<RecruitmentRequestReplacementReason>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les motifs de remplacement");
                throw;
            }
        }

        public async Task<IEnumerable<RecruitmentRequestReplacementReason>> GetByRequestIdAsync(string requestId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requestId))
                {
                    _logger.LogWarning("ID de demande de recrutement vide ou null pour la récupération des motifs de remplacement");
                    return Enumerable.Empty<RecruitmentRequestReplacementReason>();
                }

                return await _repository.GetByRequestIdAsync(requestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des motifs de remplacement pour la demande ID: {RequestId}", requestId);
                throw;
            }
        }

        public async Task AddRangeAsync(IEnumerable<RecruitmentRequestReplacementReason> entities)
        {
            try
            {
                if (entities == null || !entities.Any())
                {
                    throw new ArgumentException("La liste des motifs de remplacement à ajouter ne peut pas être vide", nameof(entities));
                }

                await _repository.AddRangeAsync(entities);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Ajout en lot de {Count} motifs de remplacement réussi", entities.Count());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout de plusieurs motifs de remplacement");
                throw;
            }
        }

        public async Task AddAsync(RecruitmentRequestReplacementReason entity)
        {
            try
            {
                if (entity == null)
                    throw new ArgumentNullException(nameof(entity), "L'entité de motif de remplacement ne peut pas être null");

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Ajout réussi d'un motif de remplacement pour la demande ID: {RequestId}", entity.RecruitmentRequestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout du motif de remplacement");
                throw;
            }
        }

        public async Task DeleteAsync(string requestId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requestId))
                {
                    throw new ArgumentException("L'ID de la demande ne peut pas être null ou vide", nameof(requestId));
                }

                await _repository.DeleteAsync(requestId);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Suppression réussie de tous les motifs pour la demande ID: {RequestId}", requestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression des motifs de remplacement pour la demande ID: {RequestId}", requestId);
                throw;
            }
        }

        public async Task DeleteAsync(string requestId, string reasonId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requestId) || string.IsNullOrWhiteSpace(reasonId))
                {
                    throw new ArgumentException("L'ID de la demande ou l'ID du motif ne peut pas être null ou vide");
                }

                await _repository.DeleteAsync(requestId, reasonId);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Suppression réussie du motif {ReasonId} pour la demande ID: {RequestId}", reasonId, requestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du motif {ReasonId} pour la demande ID: {RequestId}", reasonId, requestId);
                throw;
            }
        }
    }
}
