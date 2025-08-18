using MyApp.Api.Entities.recruitment;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Services.recruitment
{
    public interface IApprovalFlowEmployeeService
    {
        Task<IEnumerable<ApprovalFlowEmployee>> GetLatestByApproverRoleForActiveEmployeesAsync();
        Task<IEnumerable<ApprovalFlowEmployee>> GetAllAsync();
        Task<IEnumerable<ApprovalFlowEmployee>> GetByEmployeeIdAsync(string employeeId);
        Task<IEnumerable<ApprovalFlowEmployee>> GetByApprovalFlowIdAsync(string approvalFlowId);
        Task AddAsync(ApprovalFlowEmployee entity);
        Task AddRangeAsync(IEnumerable<ApprovalFlowEmployee> entities);
        Task DeleteAsync(string employeeId, string approvalFlowId);
    }
    public class ApprovalFlowEmployeeService : IApprovalFlowEmployeeService
    {
        private readonly IApprovalFlowEmployeeRepository _repository;
        private readonly ILogger<ApprovalFlowEmployeeService> _logger;

        public ApprovalFlowEmployeeService(
            IApprovalFlowEmployeeRepository repository,
            ILogger<ApprovalFlowEmployeeService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<ApprovalFlowEmployee>> GetLatestByApproverRoleForActiveEmployeesAsync()
        {
            return await _repository.GetAllGroupedByApproverRoleWithActiveEmployeesAsync();
        }


        public async Task<IEnumerable<ApprovalFlowEmployee>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<IEnumerable<ApprovalFlowEmployee>> GetByEmployeeIdAsync(string employeeId)
        {
            return await _repository.GetByEmployeeIdAsync(employeeId);
        }

        public async Task<IEnumerable<ApprovalFlowEmployee>> GetByApprovalFlowIdAsync(string approvalFlowId)
        {
            return await _repository.GetByApprovalFlowIdAsync(approvalFlowId);
        }

        public async Task AddAsync(ApprovalFlowEmployee entity)
        {
            await _repository.AddAsync(entity);
            await _repository.SaveChangesAsync();
        }

        public async Task AddRangeAsync(IEnumerable<ApprovalFlowEmployee> entities)
        {
            await _repository.AddRangeAsync(entities);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteAsync(string employeeId, string approvalFlowId)
        {
            await _repository.DeleteAsync(employeeId, approvalFlowId);
            await _repository.SaveChangesAsync();
        }
    }
}
