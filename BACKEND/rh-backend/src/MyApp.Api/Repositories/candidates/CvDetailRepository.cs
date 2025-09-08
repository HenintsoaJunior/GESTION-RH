using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.candidates;

namespace MyApp.Api.Repositories.candidates
{
    public interface ICvDetailRepository
    {
        Task<IEnumerable<CvDetail>> GetAllAsync();
        Task<CvDetail?> GetByIdAsync(string id);
        Task<IEnumerable<CvDetail>> GetByApplicationIdAsync(string applicationId);
        Task AddAsync(CvDetail entity);
        Task UpdateAsync(CvDetail entity);
        Task DeleteAsync(CvDetail entity);
        Task SaveChangesAsync();
    }

    public class CvDetailRepository : ICvDetailRepository
    {
        private readonly AppDbContext _context;

        public CvDetailRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CvDetail>> GetAllAsync()
        {
            return await _context.CvDetails
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<CvDetail?> GetByIdAsync(string id)
        {
            return await _context.CvDetails
                .FirstOrDefaultAsync(c => c.CvDetailId == id);
        }

        public async Task<IEnumerable<CvDetail>> GetByApplicationIdAsync(string applicationId)
        {
            return await _context.CvDetails
                .Where(c => c.ApplicationId == applicationId)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(CvDetail entity)
        {
            await _context.CvDetails.AddAsync(entity);
        }

        public Task UpdateAsync(CvDetail entity)
        {
            _context.CvDetails.Update(entity);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(CvDetail entity)
        {
            _context.CvDetails.Remove(entity);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
