using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IApprovalFlowService
    {
        Task<IEnumerable<ApprovalFlow>> GetAllAsync();
        Task<ApprovalFlow?> GetByIdAsync(string id);
        Task AddAsync(ApprovalFlow approvalFlow);
        Task UpdateAsync(ApprovalFlow approvalFlow);
        Task DeleteAsync(string id);
    }

    public class ApprovalFlowService : IApprovalFlowService
    {
        private readonly IApprovalFlowRepository _repository;

        public ApprovalFlowService(IApprovalFlowRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<ApprovalFlow>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<ApprovalFlow?> GetByIdAsync(string id)
        {
            var e = await _repository.GetByIdAsync(id);
            if (e == null) return null;
            return e;
        }

        public async Task AddAsync(ApprovalFlow approvalFlow)
        {
            await _repository.AddAsync(approvalFlow);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(ApprovalFlow approvalFlow)
        {
            var entity = await _repository.GetByIdAsync(approvalFlow.ApprovalFlowId);
            if (entity == null) throw new Exception("ApprovalFlow not found");

            entity.ApprovalOrder = approvalFlow.ApprovalOrder;
            entity.DepartmentId = approvalFlow.DepartmentId;

            await _repository.UpdateAsync(entity);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
