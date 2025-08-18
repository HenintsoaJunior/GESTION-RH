using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.application;

namespace MyApp.Api.Repositories.application
{
    public interface IApplicationRepository
    {
        Task<IEnumerable<Application>> GetAllByCriteriaAsync(Application criteria);
        Task<IEnumerable<Application>> GetAllAsync();
        Task<Application?> GetByIdAsync(string id);
        Task AddAsync(Application application);
        Task UpdateAsync(Application application);
        Task DeleteAsync(Application application);
        Task SaveChangesAsync();
    }

    public class ApplicationRepository : IApplicationRepository
    {
        private readonly AppDbContext _context;

        public ApplicationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Application>> GetAllByCriteriaAsync(Application criteria)
        {
            var query = _context.Applications.AsQueryable();

            if (!string.IsNullOrWhiteSpace(criteria.Status))
                query = query.Where(a => a.Status == criteria.Status);

            if (!string.IsNullOrWhiteSpace(criteria.OfferId))
                query = query.Where(a => a.OfferId == criteria.OfferId);

            if (!string.IsNullOrWhiteSpace(criteria.CandidateId))
                query = query.Where(a => a.CandidateId == criteria.CandidateId);

            if (criteria.ApplicationDate.HasValue)
                query = query.Where(a => a.ApplicationDate == criteria.ApplicationDate);

            return await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
        }

        public async Task<IEnumerable<Application>> GetAllAsync()
        {
            return await _context.Applications
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<Application?> GetByIdAsync(string id)
        {
            return await _context.Applications
                .FirstOrDefaultAsync(a => a.ApplicationId == id);
        }

        public async Task AddAsync(Application application)
        {
            await _context.Applications.AddAsync(application);
        }

        public Task UpdateAsync(Application application)
        {
            _context.Applications.Update(application);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Application application)
        {
            _context.Applications.Remove(application);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
