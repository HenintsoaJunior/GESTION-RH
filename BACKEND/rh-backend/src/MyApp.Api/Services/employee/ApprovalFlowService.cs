using MyApp.Api.Entities.employee;
using MyApp.Api.Repositories.employee;

namespace MyApp.Api.Services.employee
{
    public interface IApprovalFlowService
    {
        Task<IEnumerable<ApprovalFlow>> GetAllAsync();
        Task<ApprovalFlow?> GetByIdAsync(string id);
        Task<IEnumerable<ApprovalFlow>> GetByApproverIdAsync(string approverId);
        Task AddAsync(ApprovalFlow flow);
        Task UpdateAsync(ApprovalFlow flow);
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
            return await _repository.GetByIdAsync(id);
        }

        public async Task<IEnumerable<ApprovalFlow>> GetByApproverIdAsync(string approverId)
        {
            return await _repository.GetByApproverIdAsync(approverId);
        }

        public async Task AddAsync(ApprovalFlow flow)
        {
            await _repository.AddAsync(flow);
            await _repository.SaveChangesAsync();
        }

        public async Task UpdateAsync(ApprovalFlow flow)
        {
            await _repository.UpdateAsync(flow);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();
        }
    }
}
