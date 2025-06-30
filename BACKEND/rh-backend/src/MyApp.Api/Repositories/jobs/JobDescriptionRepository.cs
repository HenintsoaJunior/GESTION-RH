using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.jobs;

namespace MyApp.Api.Repositories.jobs
{
    public interface IJobDescriptionRepository
    {
        Task<IEnumerable<JobDescription>> GetAllAsync();
        Task<JobDescription?> GetByIdAsync(string id);
        Task AddAsync(JobDescription jobDescription);
        Task UpdateAsync(JobDescription jobDescription);
        Task DeleteAsync(string id);
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
                .Include(j => j.Department)
                .Include(j => j.ContractType)
                .OrderByDescending(j => j.CreatedAt)
                .ToListAsync();
        }


        public async Task<JobDescription?> GetByIdAsync(string id)
        {
            return await _context.JobDescriptions
                .Include(j => j.Department)
                .Include(j => j.ContractType)
                .FirstOrDefaultAsync(j => j.DescriptionId == id);
        }

        public async Task AddAsync(JobDescription jobDescription)
        {
            await _context.JobDescriptions.AddAsync(jobDescription);
        }

        public Task UpdateAsync(JobDescription jobDescription)
        {
            EntityAuditHelper.SetUpdatedTimestamp(jobDescription);
            _context.JobDescriptions.Update(jobDescription);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
                _context.JobDescriptions.Remove(entity);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}