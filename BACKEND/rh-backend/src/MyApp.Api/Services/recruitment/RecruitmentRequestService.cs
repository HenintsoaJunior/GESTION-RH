using Microsoft.EntityFrameworkCore.Storage;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.employee;
using MyApp.Api.Repositories.recruitment;
using MyApp.Api.Services.employee;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentRequestService
    {
        Task<string> CreateRequest(RecruitmentRequest request, RecruitmentRequestDetail detail, IEnumerable<RecruitmentRequestReplacementReason> requestReplacementReasons);
        Task<IEnumerable<RecruitmentRequest>> GetAllAsync();
        Task<RecruitmentRequest?> GetByRequestIdAsync(string requestId);
        Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAsync(string requesterId);
        Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAndValidatedAsync(string requesterId);
        Task AddAsync(RecruitmentRequest request);
        Task UpdateAsync(RecruitmentRequest request);
        Task DeleteAsync(string requestId);
    }

    public class RecruitmentRequestService : IRecruitmentRequestService
    {
        private readonly IRecruitmentRequestRepository _requestRepository;
        private readonly IRecruitmentRequestDetailService _requestDetailService;
        private readonly IRecruitmentRequestReplacementReasonService _replacementReasonService;
        private readonly IApprovalFlowEmployeeRepository _approvalFlowRepository;
        private readonly IRecruitmentApprovalService _approvalService;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<RecruitmentRequestService> _logger;

        public RecruitmentRequestService(
            IRecruitmentRequestRepository requestRepository,
            IRecruitmentRequestDetailService requestDetailService,
            IRecruitmentRequestReplacementReasonService replacementReasonService,
            IApprovalFlowEmployeeRepository approvalFlowRepository,
            IRecruitmentApprovalService approvalService,
            ISequenceGenerator sequenceGenerator,
            ILogger<RecruitmentRequestService> logger)
        {
            _requestRepository = requestRepository;
            _requestDetailService = requestDetailService;
            _replacementReasonService = replacementReasonService;
            _approvalFlowRepository = approvalFlowRepository;
            _approvalService = approvalService;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<string> CreateRequest(RecruitmentRequest request, RecruitmentRequestDetail detail, IEnumerable<RecruitmentRequestReplacementReason> requestReplacementReasons)
        {
            using var transaction = await _requestRepository.BeginTransactionAsync(); // tu dois exposer cette méthode dans ton repository
            try
            {
                if (string.IsNullOrWhiteSpace(request.RecruitmentRequestId))
                {
                    request.RecruitmentRequestId = _sequenceGenerator.GenerateSequence("seq_recruitment_request_id", "REQ", 6, "-");
                }

                await _requestRepository.AddAsync(request);
                await _requestRepository.SaveChangesAsync();
                _logger.LogInformation("Demande de recrutement créée avec l'ID: {RequestId}", request.RecruitmentRequestId);

                if (detail != null)
                {
                    detail.RecruitmentRequestId = request.RecruitmentRequestId;
                    await _requestDetailService.AddAsync(detail);
                    _logger.LogInformation("Détail de la demande de recrutement créé avec l'ID: {DetailId}", detail.RecruitmentRequestDetailId);
                }

                if (requestReplacementReasons != null && requestReplacementReasons.Any())
                {
                    var reasonsToAdd = requestReplacementReasons.Select(r => new RecruitmentRequestReplacementReason
                    {
                        RecruitmentRequestId = request.RecruitmentRequestId,
                        ReplacementReasonId = r.ReplacementReasonId,
                        Description = r.Description,
                    }).ToList();

                    await _replacementReasonService.AddRangeAsync(reasonsToAdd);
                    _logger.LogInformation("Raisons du remplacement de la demande de recrutement créées");
                }

                var approvalFlowEmployee = await _approvalFlowRepository.GetAllGroupedByApproverRoleWithActiveEmployeesAsync();
                await _approvalService.AddAsync(request.RecruitmentRequestId, approvalFlowEmployee);
                _logger.LogInformation("Approbation de la demande de recrutement créée pour l'ID: {RequestId}", request.RecruitmentRequestId);

                await transaction.CommitAsync(); // Valider les opérations
                return request.RecruitmentRequestId;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(); // Annuler si erreur
                _logger.LogError(ex, ex.Message);
                throw;
            }
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

                if (string.IsNullOrWhiteSpace(request.RecruitmentRequestId))
                {
                    request.RecruitmentRequestId = _sequenceGenerator.GenerateSequence("seq_recruitment_request_id", "REQ", 6, "-");
                }

                await _requestRepository.AddAsync(request);
                await _requestRepository.SaveChangesAsync();
                
                _logger.LogInformation("Demande de recrutement ajoutée avec succès avec l'ID: {RequestId}", request.RecruitmentRequestId);
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