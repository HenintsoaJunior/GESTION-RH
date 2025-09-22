using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MyApp.Api.Data;
using MyApp.Api.Entities.jobs;
using MyApp.Api.Models.dto.jobs;

namespace MyApp.Api.Repositories.jobs
{
    public interface IJobOfferRepository
    {
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<(IEnumerable<JobOffer>, int)> GetAllByCriteriaAsync(JobOfferSearchDTO criteria, int page, int pageSize);
        Task<IEnumerable<JobOffer>> GetAllAsync();
        Task<JobOffer?> GetByIdAsync(string id);
        Task AddAsync(JobOffer offer);
        Task UpdateAsync(JobOffer offer);
        Task DeleteAsync(JobOffer offer);
        Task SaveChangesAsync();
        Task<JobOfferStats> GetStatisticsAsync();
        Task<IEnumerable<JobOffer>> GetLastThreeNonClosedAsync();
    }

    public class JobOfferRepository : IJobOfferRepository
    {
        private readonly AppDbContext _context;

        public JobOfferRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<JobOffer>> GetLastThreeNonClosedAsync()
        {
            return await _context.JobOffers
                .Include(o => o.JobDescription)
                .Include(o => o.RecruitmentRequest)
                    .ThenInclude(r => r!.Site)
                .Include(o => o.RecruitmentRequest)
                    .ThenInclude(r => r!.ContractType)
                .Where(o => o.Status != "Clôturée")
                .OrderByDescending(o => o.CreatedAt)
                .Take(3)
                .ToListAsync();
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }

        public async Task<JobOfferStats> GetStatisticsAsync()
        {
            var stats = await _context.JobOffers
                .GroupBy(o => 1) // Single group to compute all aggregates
                .Select(g => new JobOfferStats
                {
                    Total = g.Count(),
                    Publiee = g.Count(o => o.Status == "Publiée"),
                    EnCours = g.Count(o => o.Status == "En Cours"),
                    Cloturee = g.Count(o => o.Status == "Clôturée"),
                    Annulee = g.Count(o => o.Status == "Annulée")
                })
                .FirstOrDefaultAsync();

            return stats ?? new JobOfferStats();
        }

        public async Task<(IEnumerable<JobOffer>, int)> GetAllByCriteriaAsync(JobOfferSearchDTO criteria, int page, int pageSize)
        {
            var query = _context.JobOffers
                .Include(o => o.JobDescription)
                .Include(o => o.RecruitmentRequest)
                    .ThenInclude(r => r!.Site)
                .Include(o => o.RecruitmentRequest)
                    .ThenInclude(r => r!.ContractType)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(criteria.Status))
            {
                query = query.Where(o => o.Status == criteria.Status);
            }

            if (!string.IsNullOrWhiteSpace(criteria.JobTitleKeyword))
            {
                query = query.Where(o => o.JobDescription != null && 
                                        o.JobDescription.Title != null && 
                                        o.JobDescription.Title.Contains(criteria.JobTitleKeyword));
            }

            if (criteria.PublicationDateMin.HasValue)
            {
                query = query.Where(o => o.CreatedAt >= criteria.PublicationDateMin.Value);
            }

            if (criteria.PublicationDateMax.HasValue)
            {
                query = query.Where(o => o.CreatedAt <= criteria.PublicationDateMax.Value);
            }

            if (!string.IsNullOrWhiteSpace(criteria.SiteId))
            {
                query = query.Where(o => o.RecruitmentRequest != null && o.RecruitmentRequest.SiteId == criteria.SiteId);
            }

            if (!string.IsNullOrWhiteSpace(criteria.ContractTypeId))
            {
                query = query.Where(o => o.RecruitmentRequest != null && o.RecruitmentRequest.ContractTypeId == criteria.ContractTypeId);
            }

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task<IEnumerable<JobOffer>> GetAllAsync()
        {
            return await _context.JobOffers
                .Include(o => o.JobDescription)
                .Include(o => o.RecruitmentRequest)
                    .ThenInclude(r => r!.Site)
                .Include(o => o.RecruitmentRequest)
                    .ThenInclude(r => r!.ContractType)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();
        }

        public async Task<JobOffer?> GetByIdAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                throw new ArgumentException("The ID cannot be null or empty.", nameof(id));
            }

            return await _context.JobOffers
                .Include(o => o.JobDescription)
                .Include(o => o.RecruitmentRequest)
                    .ThenInclude(r => r != null ? r.Site : null)
                .Include(o => o.RecruitmentRequest)
                    .ThenInclude(r => r != null ? r.ContractType : null)
                .Include(o => o.Requester)
                .FirstOrDefaultAsync(o => o.OfferId == id);
        }

        public async Task AddAsync(JobOffer offer)
        {
            await _context.JobOffers.AddAsync(offer);
        }

        public async Task UpdateAsync(JobOffer offer)
        {
            _context.JobOffers.Update(offer);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(JobOffer offer)
        {
            _context.JobOffers.Remove(offer);
            await Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}