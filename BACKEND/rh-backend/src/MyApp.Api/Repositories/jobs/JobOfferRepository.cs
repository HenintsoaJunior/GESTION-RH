using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.jobs;

namespace MyApp.Api.Repositories.jobs
{
    public interface IJobOfferRepository
    {
        Task<IEnumerable<JobOffer>> GetAllAsync();
        Task<JobOffer?> GetByIdAsync(string id);
        Task<IEnumerable<JobOffer>> GetByStatusAsync(string status);
        Task AddAsync(JobOffer offer);
        Task UpdateAsync(JobOffer offer);
        Task DeleteAsync(JobOffer offer);
        Task SaveChangesAsync();
    }
    public class JobOfferRepository : IJobOfferRepository
    {
        private readonly AppDbContext _context;

        public JobOfferRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<JobOffer>> GetAllAsync()
        {
            return await _context.JobOffers
                .Include(o => o.ContractType)
                .Include(o => o.Site)
                .Include(o => o.JobDescription)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<JobOffer?> GetByIdAsync(string id)
        {
            return await _context.JobOffers
                .Include(o => o.ContractType)
                .Include(o => o.Site)
                .Include(o => o.JobDescription)
                .FirstOrDefaultAsync(o => o.OfferId == id);
        }

        public async Task<IEnumerable<JobOffer>> GetByStatusAsync(string status)
        {
            return await _context.JobOffers
                .Where(o => o.Status == status)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(JobOffer offer)
        {
            await _context.JobOffers.AddAsync(offer);
        }

        public Task UpdateAsync(JobOffer offer)
        {
            _context.JobOffers.Update(offer);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(JobOffer offer)
        {
            _context.JobOffers.Remove(offer);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}

