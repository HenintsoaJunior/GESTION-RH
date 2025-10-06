using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IExpenseReportAttachmentRepository
    {
        Task<IEnumerable<ExpenseReportAttachment>> GetByAssignationIdAsync(string assignationId);
        Task AddAsync(ExpenseReportAttachment entity);
        Task DeleteAsync(ExpenseReportAttachment entity);
        Task SaveChangesAsync();
    }

    public class ExpenseReportAttachmentRepository : IExpenseReportAttachmentRepository
    {
        private readonly AppDbContext _context;

        public ExpenseReportAttachmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ExpenseReportAttachment>> GetByAssignationIdAsync(string assignationId)
        {
            return await _context.ExpenseReportAttachments
                .AsNoTracking()
                .Where(a => a.AssignationId == assignationId)
                .ToListAsync();
        }

        public async Task AddAsync(ExpenseReportAttachment entity)
        {
            await _context.ExpenseReportAttachments.AddAsync(entity);
        }

        public Task DeleteAsync(ExpenseReportAttachment entity)
        {
            _context.ExpenseReportAttachments.Remove(entity);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}