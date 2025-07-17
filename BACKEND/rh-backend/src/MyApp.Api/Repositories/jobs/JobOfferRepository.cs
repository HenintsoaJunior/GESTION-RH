using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.jobs;

namespace MyApp.Api.Repositories.jobs
{
    public interface IJobOfferRepository
    {
        Task<IEnumerable<JobOffer>> GetAllByCriteriaAsync(JobOffer criteria);
        Task<IEnumerable<JobOffer>> GetAllAsync();
        Task<JobOffer?> GetByIdAsync(string id);
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

        public async Task<IEnumerable<JobOffer>> GetAllByCriteriaAsync(JobOffer criteria)
        {
            var query = _context.JobOffers
                .Include(o => o.ContractType)
                .Include(o => o.Site)
                .Include(o => o.JobDescription)
                .AsQueryable();

            if (!string.IsNullOrEmpty(criteria.Status))
            {
                query = query.Where(o => o.Status == criteria.Status);
            }

            if (!string.IsNullOrEmpty(criteria.SiteId))
            {
                query = query.Where(o => o.SiteId == criteria.SiteId);
            }

            if (!string.IsNullOrEmpty(criteria.DescriptionId))
            {
                query = query.Where(o => o.DescriptionId == criteria.DescriptionId);
            }

            if (!string.IsNullOrEmpty(criteria.ContractTypeId))
            {
                query = query.Where(o => o.ContractTypeId == criteria.ContractTypeId);
            }

            if (criteria.CreatedAt != default(DateTime))
            {
                // Tu peux ajuster ce filtre pour comparer uniquement la date sans l'heure si besoin
                query = query.Where(o => o.CreatedAt.Date == criteria.CreatedAt.Date);
            }

            return await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
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

