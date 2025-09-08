using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.application;

namespace MyApp.Api.Repositories.application
{
    public interface IApplicationCommentRepository
    {
        Task<IEnumerable<ApplicationComment>> GetAllAsync();
        Task<ApplicationComment?> GetByIdAsync(string id);
        Task<IEnumerable<ApplicationComment>> GetByApplicationIdAsync(string applicationId);
        Task AddAsync(ApplicationComment entity);
        Task UpdateAsync(ApplicationComment entity);
        Task DeleteAsync(ApplicationComment entity);
        Task SaveChangesAsync();
    }
    public class ApplicationCommentRepository : IApplicationCommentRepository
    {
        private readonly AppDbContext _context;

        public ApplicationCommentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ApplicationComment>> GetAllAsync()
        {
            return await _context.ApplicationComments
                .Include(c => c.User)
                .Include(c => c.Application)
                .ToListAsync();
        }

        public async Task<ApplicationComment?> GetByIdAsync(string id)
        {
            return await _context.ApplicationComments
                .Include(c => c.User)
                .Include(c => c.Application)
                .FirstOrDefaultAsync(c => c.CommentId == id);
        }

        public async Task<IEnumerable<ApplicationComment>> GetByApplicationIdAsync(string applicationId)
        {
            return await _context.ApplicationComments
                .Include(c => c.User)
                .Where(c => c.ApplicationId == applicationId)
                .ToListAsync();
        }

        public async Task AddAsync(ApplicationComment entity)
        {
            await _context.ApplicationComments.AddAsync(entity);
        }

        public Task UpdateAsync(ApplicationComment entity)
        {
            _context.ApplicationComments.Update(entity);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(ApplicationComment entity)
        {
            _context.ApplicationComments.Remove(entity);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}