using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IApprovalFlowRepository
    {
        Task<IEnumerable<ApprovalFlow>> GetAllAsync();
        Task<ApprovalFlow?> GetByIdAsync(string id);
        Task AddAsync(ApprovalFlow flow);
        Task UpdateAsync(ApprovalFlow flow); // Gardé comme async pour cohérence avec l'interface
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
            return await _context.ApprovalFlows.Include(a => a.Department).ToListAsync();
        }

        public async Task<ApprovalFlow?> GetByIdAsync(string id)
        {
            return await _context.ApprovalFlows.Include(a => a.Department)
                                               .FirstOrDefaultAsync(a => a.ApprovalFlowId == id);
        }

        public async Task AddAsync(ApprovalFlow flow)
        {
            await _context.ApprovalFlows.AddAsync(flow);
        }

        public Task UpdateAsync(ApprovalFlow flow) // Retiré async car pas d'opération asynchrone
        {
            EntityAuditHelper.SetUpdatedTimestamp(flow);
            _context.ApprovalFlows.Update(flow);
            return Task.CompletedTask; // Retourne une tâche complétée pour respecter la signature Task
        }

        public async Task DeleteAsync(string id)
        {
            var flow = await GetByIdAsync(id);
            if (flow != null)
                _context.ApprovalFlows.Remove(flow);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}