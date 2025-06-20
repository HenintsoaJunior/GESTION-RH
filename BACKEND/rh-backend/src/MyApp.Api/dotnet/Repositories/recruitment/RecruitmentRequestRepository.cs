using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentRequestRepository
    {
        Task<IEnumerable<RecruitmentRequest>> GetByCriteriaAsync(RecruitmentRequestCriteria criteria);

        Task<IEnumerable<RecruitmentRequest>> GetPaginatedAsync(int startIndex, int count);
        Task<IEnumerable<RecruitmentRequest>> GetAllAsync();
        Task<RecruitmentRequest?> GetByIdAsync(string id);
        Task AddAsync(RecruitmentRequest request);
        Task SaveChangesAsync();
    }

    public class RecruitmentRequestRepository : IRecruitmentRequestRepository
    {
        private readonly AppDbContext _context;

        public async Task<IEnumerable<RecruitmentRequest>> GetByCriteriaAsync(RecruitmentRequestCriteria criteria)
        {
            var query = _context.RecruitmentRequests.AsQueryable();

            if (!string.IsNullOrEmpty(criteria.Status))
                query = query.Where(r => r.Status == criteria.Status);

            if (!string.IsNullOrEmpty(criteria.JobTitleKeyword))
                query = query.Where(r => r.JobTitle.Contains(criteria.JobTitleKeyword));

            if (criteria.RequestDateMin.HasValue)
                query = query.Where(r => r.RequestDate >= criteria.RequestDateMin.Value);

            if (criteria.RequestDateMax.HasValue)
                query = query.Where(r => r.RequestDate <= criteria.RequestDateMax.Value);

            if (criteria.ApprovalDateMin.HasValue)
                query = query.Where(r => r.ApprovalDate != null && r.ApprovalDate >= criteria.ApprovalDateMin.Value);

            if (criteria.ApprovalDateMax.HasValue)
                query = query.Where(r => r.ApprovalDate != null && r.ApprovalDate <= criteria.ApprovalDateMax.Value);

            return await query.ToListAsync();
        }


        public async Task<IEnumerable<RecruitmentRequest>> GetPaginatedAsync(int startIndex, int count)
        {
            return await _context.RecruitmentRequests
                .OrderByDescending(r => r.RequestDate) //ou autre champs
                .Skip(startIndex)
                .Take(count)
                .ToListAsync();
        }


        public RecruitmentRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetAllAsync()
        {
            return await _context.RecruitmentRequests.ToListAsync();
        }

        public async Task<RecruitmentRequest?> GetByIdAsync(string id)
        {
            return await _context.RecruitmentRequests.FindAsync(id);
        }

        public async Task AddAsync(RecruitmentRequest request)
        {
            await _context.RecruitmentRequests.AddAsync(request);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
