using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;
using MyApp.Api.Services.users;

namespace MyApp.Api.Services.recruitment
{
    public interface IRecruitmentApprovalService
    {
        Task ValidateAsync(string requestId, string approverId);
        Task RecommendAsync(string requestId, string approverId, string comment);
        Task<IEnumerable<RecruitmentApproval>> GetByApproverIdAsync(string approverId);
        Task<IEnumerable<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId);
        Task AddAsync(string recruitmentRequestId, IEnumerable<ApprovalFlowEmployee> approvalFlows);
        Task AddAsync(RecruitmentApproval approval);
        Task UpdateAsync(RecruitmentApproval approval);
        Task<RecruitmentApproval?> GetAsync(string requestId, string approverId, string flowId);
    }

    public class RecruitmentApprovalService : IRecruitmentApprovalService
    {
        private readonly IUserService _userService;
        private readonly IRecruitmentApprovalRepository _repository;
        private readonly ILogger<RecruitmentApprovalService> _logger; // Ajouter le logger

        public RecruitmentApprovalService(
            IUserService userService,
            IRecruitmentApprovalRepository repository,
            ILogger<RecruitmentApprovalService> logger) // Injecter le logger
        {
            _userService = userService;
            _repository = repository;
            _logger = logger;
        }

        public async Task ValidateAsync(string requestId, string approverId)
        {
            await _repository.ValidateAsync(requestId, approverId);
        }

        public async Task RecommendAsync(string requestId, string approverId, string comment)
        {
            await _repository.RecommendAsync(requestId, approverId, comment);
        }

        public async Task<IEnumerable<RecruitmentApproval>> GetByApproverIdAsync(string approverId)
        {
            return await _repository.GetByApproverIdAsync(approverId);
        }

        public async Task<IEnumerable<RecruitmentApproval>> GetByStatusAndApproverIdAsync(string status, string approverId)
        {
            return await _repository.GetByStatusAndApproverIdAsync(status, approverId);
        }

        public async Task<RecruitmentApproval?> GetAsync(string requestId, string approverId, string flowId)
        {
            return await _repository.GetAsync(requestId, approverId, flowId);
        }

        public async Task AddAsync(string recruitmentRequestId, IEnumerable<ApprovalFlowEmployee> approvalFlows)
        {
            _logger.LogInformation("Début de la création des RecruitmentApprovals pour RecruitmentRequestId: {RecruitmentRequestId}", recruitmentRequestId);

            try
            {
                IEnumerable<RecruitmentApproval> recruitmentApprovals = await RecruitmentApproval.GetRecruitmentApprovalsFromApprovalFlows(recruitmentRequestId, approvalFlows, _userService);
                await _repository.AddRangeAsync(recruitmentApprovals);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("RecruitmentApprovals ajoutés avec succès pour RecruitmentRequestId: {RecruitmentRequestId}", recruitmentRequestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout des RecruitmentApprovals pour RecruitmentRequestId: {RecruitmentRequestId}", recruitmentRequestId);
                throw; // Relancer l'exception pour que l'appelant puisse la gérer
            }
        }

        public async Task AddAsync(RecruitmentApproval approval)
        {
            _logger.LogInformation("Ajout d'un RecruitmentApproval: RecruitmentRequestId={RecruitmentRequestId}, ApproverId={ApproverId}",
                approval.RecruitmentRequestId, approval.ApproverId);

            try
            {
                await _repository.AddAsync(approval);
                await _repository.SaveChangesAsync();
                _logger.LogInformation("RecruitmentApproval ajouté avec succès: RecruitmentRequestId={RecruitmentRequestId}", approval.RecruitmentRequestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout d'un RecruitmentApproval: RecruitmentRequestId={RecruitmentRequestId}", approval.RecruitmentRequestId);
                throw;
            }
        }

        public async Task UpdateAsync(RecruitmentApproval approval)
        {
            _logger.LogInformation("Mise à jour d'un RecruitmentApproval: RecruitmentRequestId={RecruitmentRequestId}, ApproverId={ApproverId}",
                approval.RecruitmentRequestId, approval.ApproverId);

            try
            {
                await _repository.UpdateAsync(approval);
                await _repository.SaveChangesAsync();
                _logger.LogInformation("RecruitmentApproval mis à jour avec succès: RecruitmentRequestId={RecruitmentRequestId}", approval.RecruitmentRequestId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour d'un RecruitmentApproval: RecruitmentRequestId={RecruitmentRequestId}", approval.RecruitmentRequestId);
                throw;
            }
        }
    }
}