// ===== SERVICE INTERFACE =====
using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.form.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestService
    {
        Task<string> CreateRequestAsync(RecruitmentRequest request);
        Task<string> CreateRequest(RecruitmentRequest request); // AJOUT POUR COMPATIBILITÉ
        Task<IEnumerable<RecruitmentRequest>> GetAllAsync();
        Task<RecruitmentRequest?> GetByRequestIdAsync(string requestId);
        Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAsync(string requesterId);
        Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAndValidatedAsync(string requesterId);
        Task AddAsync(RecruitmentRequest request);
        Task UpdateAsync(RecruitmentRequest request);
        Task DeleteAsync(string requestId);
    }

    // ===== SERVICE IMPLEMENTATION =====
    public class RecruitmentRequestService : IRecruitmentRequestService
    {
        private readonly IRecruitmentRequestRepository _requestRepository;
        private readonly IRecruitmentRequestDetailRepository _requestDetailRepository;
        private readonly IRecruitmentApprovalRepository _approvalRepository;
        private readonly IRecruitmentRequestReplacementReasonRepository _replacementReasonRepository;
        private readonly ILogger<RecruitmentRequestService> _logger;

        public RecruitmentRequestService(
            IRecruitmentRequestRepository requestRepository,
            IRecruitmentRequestDetailRepository requestDetailRepository,
            IRecruitmentApprovalRepository approvalRepository,
            IRecruitmentRequestReplacementReasonRepository replacementReasonRepository,
            ILogger<RecruitmentRequestService> logger)
        {
            _requestRepository = requestRepository;
            _requestDetailRepository = requestDetailRepository;
            _approvalRepository = approvalRepository;
            _replacementReasonRepository = replacementReasonRepository;
            _logger = logger;
        }

        public async Task<string> CreateRequestAsync(RecruitmentRequest request)
        {
            try
            {
                await _requestRepository.AddAsync(request);
                await _requestRepository.SaveChangesAsync();
                
                // Recharger l'entité pour obtenir l'ID généré par le trigger
                await _requestRepository.ReloadAsync(request);
                
                string requestId = request.RecruitmentRequestId;
                _logger.LogInformation("RequestID EST BLALALALLALALA {RequestId}", requestId);
                
                return requestId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la demande de recrutement");
                throw;
            }
        }

        // AJOUT POUR COMPATIBILITÉ AVEC LE CONTRÔLEUR
        public async Task<string> CreateRequest(RecruitmentRequest request)
        {
            return await CreateRequestAsync(request);
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetAllAsync()
        {
            try
            {
                return await _requestRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les demandes de recrutement");
                throw;
            }
        }

        public async Task<RecruitmentRequest?> GetByRequestIdAsync(string requestId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requestId))
                {
                    _logger.LogWarning("Tentative de récupération d'une demande avec un ID null ou vide");
                    return null;
                }

                return await _requestRepository.GetByRequestIdAsync(requestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la demande avec l'ID: {RequestId}", requestId);
                throw;
            }
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAsync(string requesterId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requesterId))
                {
                    _logger.LogWarning("Tentative de récupération des demandes avec un ID demandeur null ou vide");
                    return Enumerable.Empty<RecruitmentRequest>();
                }

                return await _requestRepository.GetByRequesterIdAsync(requesterId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des demandes pour le demandeur: {RequesterId}", requesterId);
                throw;
            }
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAndValidatedAsync(string requesterId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requesterId))
                {
                    _logger.LogWarning("Tentative de récupération des demandes validées avec un ID demandeur null ou vide");
                    return Enumerable.Empty<RecruitmentRequest>();
                }

                return await _requestRepository.GetByRequesterIdAndValidatedAsync(requesterId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des demandes validées pour le demandeur: {RequesterId}", requesterId);
                throw;
            }
        }

        public async Task AddAsync(RecruitmentRequest request)
        {
            try
            {
                if (request == null)
                {
                    throw new ArgumentNullException(nameof(request), "La demande de recrutement ne peut pas être null");
                }

                await _requestRepository.AddAsync(request);
                await _requestRepository.SaveChangesAsync();
                
                _logger.LogInformation("Demande de recrutement ajoutée avec succès");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout de la demande de recrutement");
                throw;
            }
        }

        public async Task UpdateAsync(RecruitmentRequest request)
        {
            try
            {
                if (request == null)
                {
                    throw new ArgumentNullException(nameof(request), "La demande de recrutement ne peut pas être null");
                }

                await _requestRepository.UpdateAsync(request);
                await _requestRepository.SaveChangesAsync();
                
                _logger.LogInformation("Demande de recrutement mise à jour avec succès pour l'ID: {RequestId}", request.RecruitmentRequestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la demande de recrutement avec l'ID: {RequestId}", request?.RecruitmentRequestId);
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

                await _requestRepository.DeleteAsync(requestId);
                await _requestRepository.SaveChangesAsync();
                
                _logger.LogInformation("Demande de recrutement supprimée avec succès pour l'ID: {RequestId}", requestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la demande de recrutement avec l'ID: {RequestId}", requestId);
                throw;
            }
        }
    }
}