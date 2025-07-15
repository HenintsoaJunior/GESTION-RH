using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.jobs;

namespace MyApp.Api.Repositories.jobs
{
    public interface IJobDescriptionRepository
    {
        Task<IEnumerable<JobDescription>> GetAllAsync();
        Task<JobDescription?> GetByIdAsync(string id);
        Task<IEnumerable<JobDescription>> GetBySiteAsync(string siteId);
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

        public async Task<IEnumerable<JobDescription>> GetAllAsync()
        {
            return await _context.JobDescriptions
                .Include(j => j.Site)
                .Include(j => j.Organigram)
                .Include(j => j.HierarchicalAttachment)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }

        public async Task<JobDescription?> GetByIdAsync(string id)
        {
            return await _context.JobDescriptions
                .Include(j => j.Site)
                .Include(j => j.Organigram)
                .Include(j => j.HierarchicalAttachment)
                .FirstOrDefaultAsync(j => j.DescriptionId == id);
        }

        public async Task<IEnumerable<JobDescription>> GetBySiteAsync(string siteId)
        {
            return await _context.JobDescriptions
                .Include(j => j.Site)
                .Include(j => j.Organigram)
                .Include(j => j.HierarchicalAttachment)
                .Where(j => j.SiteId == siteId)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
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
