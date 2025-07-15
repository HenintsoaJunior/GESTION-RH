using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Repositories.employee
{
    public interface IApprovalFlowRepository
    {
        Task<IEnumerable<ApprovalFlow>> GetAllAsync();
        Task<ApprovalFlow?> GetByIdAsync(string id);
        Task<IEnumerable<ApprovalFlow>> GetByApproverIdAsync(string approverId);
        Task AddAsync(ApprovalFlow flow);
        Task UpdateAsync(ApprovalFlow flow);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class ApprovalFlowRepository : IApprovalFlowRepository
    {
        private readonly AppDbContext _context;

        public ApprovalFlowRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ApprovalFlow>> GetAllAsync()
        {
            return await _context.ApprovalFlows
                .Include(a => a.Approver)
                .OrderBy(a => a.ApprovalOrder)
                .ToListAsync();
        }

        public async Task<ApprovalFlow?> GetByIdAsync(string id)
        {
            return await _context.ApprovalFlows
                .Include(a => a.Approver)
                .FirstOrDefaultAsync(a => a.ApprovalFlowId == id);
        }

        public async Task<IEnumerable<ApprovalFlow>> GetByApproverIdAsync(string approverId)
        {
            return await _context.ApprovalFlows
                .Where(a => a.ApproverId == approverId)
                .Include(a => a.Approver)
                .OrderBy(a => a.ApprovalOrder)
                .ToListAsync();
        }

        public async Task AddAsync(ApprovalFlow flow)
        {
            await _context.ApprovalFlows.AddAsync(flow);
        }

        public Task UpdateAsync(ApprovalFlow flow)
        {
            _context.ApprovalFlows.Update(flow);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var existing = await GetByIdAsync(id);
            if (existing != null)
                _context.ApprovalFlows.Remove(existing);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
