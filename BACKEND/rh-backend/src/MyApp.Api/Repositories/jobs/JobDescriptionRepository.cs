using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.jobs;

namespace MyApp.Api.Repositories.jobs
{
    public interface IJobDescriptionRepository
    {
        Task<IEnumerable<JobDescription>> GetAllByCriteriaAsync(JobDescription criteria);
        Task<IEnumerable<JobDescription>> GetAllAsync();
        Task<JobDescription?> GetByIdAsync(string id);
        Task AddAsync(JobDescription jobDescription);
        Task UpdateAsync(JobDescription jobDescription);
        Task DeleteAsync(JobDescription jobDescription);
        Task SaveChangesAsync();
    }
    public class JobDescriptionRepository : IJobDescriptionRepository
    {
        private readonly AppDbContext _context;

        public JobDescriptionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<JobDescription>> GetAllByCriteriaAsync(JobDescription criteria)
        {
            var query = _context.JobDescriptions
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(criteria.Title))
                query = query.Where(j => j.Title.Contains(criteria.Title));

            return await query
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<JobDescription>> GetAllAsync()
        {
            return await _context.JobDescriptions
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }

        public async Task<JobDescription?> GetByIdAsync(string id)
        {
            return await _context.JobDescriptions
                .FirstOrDefaultAsync(j => j.DescriptionId == id);
        }

        public async Task AddAsync(JobDescription jobDescription)
        {
            await _context.JobDescriptions.AddAsync(jobDescription);
        }

        public Task UpdateAsync(JobDescription jobDescription)
        {
            _context.JobDescriptions.Update(jobDescription);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(JobDescription jobDescription)
        {
            _context.JobDescriptions.Remove(jobDescription);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
