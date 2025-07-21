using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IApprovalFlowEmployeeRepository
    {
        Task<IEnumerable<ApprovalFlowEmployee>> GetAllGroupedByApproverRoleWithActiveEmployeesAsync();
        Task<IEnumerable<ApprovalFlowEmployee>> GetAllAsync();
        Task<IEnumerable<ApprovalFlowEmployee>> GetByEmployeeIdAsync(string employeeId);
        Task<IEnumerable<ApprovalFlowEmployee>> GetByApprovalFlowIdAsync(string approvalFlowId);
        Task AddAsync(ApprovalFlowEmployee entity);
        Task AddRangeAsync(IEnumerable<ApprovalFlowEmployee> entities);
        Task DeleteAsync(string employeeId, string approvalFlowId);
        Task SaveChangesAsync();
    }
    
    public class ApprovalFlowEmployeeRepository : IApprovalFlowEmployeeRepository
    {
        private readonly AppDbContext _context;

        public ApprovalFlowEmployeeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ApprovalFlowEmployee>> GetAllGroupedByApproverRoleWithActiveEmployeesAsync()
        {
            return await _context.ApprovalFlowEmployees
                .Include(a => a.Employee)
                .Include(a => a.ApprovalFlow)
                .Where(a => a.Employee != null && a.Employee.Status == "actif")
                .GroupBy(a => a.ApprovalFlow!.ApproverRole)
                .Select(g => g.OrderBy(a => a.EmployeeId).First())
                .ToListAsync();
        }

        public async Task<IEnumerable<ApprovalFlowEmployee>> GetAllAsync()
        {
            return await _context.ApprovalFlowEmployees.ToListAsync();
        }

        public async Task<IEnumerable<ApprovalFlowEmployee>> GetByEmployeeIdAsync(string employeeId)
        {
            return await _context.ApprovalFlowEmployees
                .Where(e => e.EmployeeId == employeeId)
                .ToListAsync();
        }

        public async Task<IEnumerable<ApprovalFlowEmployee>> GetByApprovalFlowIdAsync(string approvalFlowId)
        {
            return await _context.ApprovalFlowEmployees
                .Where(e => e.ApprovalFlowId == approvalFlowId)
                .ToListAsync();
        }

        public async Task AddAsync(ApprovalFlowEmployee entity)
        {
            await _context.ApprovalFlowEmployees.AddAsync(entity);
        }

        public async Task AddRangeAsync(IEnumerable<ApprovalFlowEmployee> entities)
        {
            await _context.ApprovalFlowEmployees.AddRangeAsync(entities);
        }

        public async Task DeleteAsync(string employeeId, string approvalFlowId)
        {
            var entity = await _context.ApprovalFlowEmployees
                .FindAsync(employeeId, approvalFlowId);

            if (entity != null)
                _context.ApprovalFlowEmployees.Remove(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
