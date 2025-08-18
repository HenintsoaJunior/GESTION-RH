using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.search.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentRequestDetailRepository
    {
        Task<IEnumerable<RecruitmentRequestDetail>> GetAllAsync();
        Task<RecruitmentRequestDetail?> GetByIdAsync(string id);
        Task<IEnumerable<RecruitmentRequestDetail>> GetByRequestIdAsync(string recruitmentRequestId);
        Task<(IEnumerable<RecruitmentRequestDetail>, int)> SearchAsync(RecruitmentRequestSearchFiltersDTO filters, int page, int pageSize);
        Task AddAsync(RecruitmentRequestDetail detail);
        Task UpdateAsync(RecruitmentRequestDetail detail);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
        // New method for fetching statistics
        Task<RecruitmentRequestStats> GetStatisticsAsync();
    }

    public class RecruitmentRequestDetailRepository : IRecruitmentRequestDetailRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentRequestDetailRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RecruitmentRequestDetail>> GetAllAsync()
        {
            return await _context.RecruitmentRequestDetails
                .Include(r => r.DirectSupervisor)
                .Include(r => r.Service)
                .Include(r => r.Department)
                .Include(r => r.Direction)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.Requester)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.ContractType)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.Site)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.RecruitmentReason)
                .ToListAsync();
        }

        public async Task<RecruitmentRequestDetail?> GetByIdAsync(string id)
        {
            return await _context.RecruitmentRequestDetails
                .Include(r => r.DirectSupervisor)
                .Include(r => r.Service)
                .Include(r => r.Department)
                .Include(r => r.Direction)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.Requester)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.ContractType)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.Site)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.RecruitmentReason)
                .FirstOrDefaultAsync(r => r.RecruitmentRequestDetailId == id);
        }

        public async Task<IEnumerable<RecruitmentRequestDetail>> GetByRequestIdAsync(string recruitmentRequestId)
        {
            return await _context.RecruitmentRequestDetails
                .Where(r => r.RecruitmentRequestId == recruitmentRequestId)
                .Include(r => r.DirectSupervisor)
                .Include(r => r.Service)
                .Include(r => r.Department)
                .Include(r => r.Direction)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.Requester)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.ContractType)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.Site)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.RecruitmentReason)
                .ToListAsync();
        }

        public async Task<(IEnumerable<RecruitmentRequestDetail>, int)> SearchAsync(RecruitmentRequestSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.RecruitmentRequestDetails
                .Include(r => r.DirectSupervisor)
                .Include(r => r.Service)
                .Include(r => r.Department)
                .Include(r => r.Direction)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.Requester)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.ContractType)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.Site)
                .Include(r => r.RecruitmentRequest)
                    .ThenInclude(rr => rr!.RecruitmentReason)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.Status))
            {
                query = query.Where(r => r.RecruitmentRequest != null && r.RecruitmentRequest.Status == filters.Status);
            }

            if (!string.IsNullOrWhiteSpace(filters.PositionTitle))
            {
                query = query.Where(r => r.RecruitmentRequest != null && 
                                       r.RecruitmentRequest.PositionTitle != null && 
                                       r.RecruitmentRequest.PositionTitle.Contains(filters.PositionTitle));
            }

            if (filters.RequestDateMin.HasValue)
            {
                query = query.Where(r => r.RecruitmentRequest != null && r.RecruitmentRequest.CreatedAt >= filters.RequestDateMin.Value);
            }

            if (filters.RequestDateMax.HasValue)
            {
                query = query.Where(r => r.RecruitmentRequest != null && r.RecruitmentRequest.CreatedAt <= filters.RequestDateMax.Value);
            }

            if (!string.IsNullOrWhiteSpace(filters.SiteId))
            {
                query = query.Where(r => r.RecruitmentRequest != null && r.RecruitmentRequest.SiteId == filters.SiteId);
            }

            if (!string.IsNullOrWhiteSpace(filters.ContractTypeId))
            {
                query = query.Where(r => r.RecruitmentRequest != null && r.RecruitmentRequest.ContractTypeId == filters.ContractTypeId);
            }

            if (!string.IsNullOrWhiteSpace(filters.DirectionId))
            {
                query = query.Where(r => r.DirectionId == filters.DirectionId);
            }

            if (!string.IsNullOrWhiteSpace(filters.DepartmentId))
            {
                query = query.Where(r => r.DepartmentId == filters.DepartmentId);
            }

            if (!string.IsNullOrWhiteSpace(filters.ServiceId))
            {
                query = query.Where(r => r.ServiceId == filters.ServiceId);
            }

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderByDescending(r => r.RecruitmentRequest != null ? r.RecruitmentRequest.CreatedAt : DateTime.MinValue)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task AddAsync(RecruitmentRequestDetail detail)
        {
            await _context.RecruitmentRequestDetails.AddAsync(detail);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(RecruitmentRequestDetail detail)
        {
            _context.RecruitmentRequestDetails.Update(detail);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var detail = await GetByIdAsync(id);
            if (detail != null)
            {
                _context.RecruitmentRequestDetails.Remove(detail);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<RecruitmentRequestStats> GetStatisticsAsync()
        {
            var total = await _context.RecruitmentRequestDetails.CountAsync();
            var enAttente = await _context.RecruitmentRequestDetails
                .CountAsync(r => r.RecruitmentRequest != null && r.RecruitmentRequest.Status == "BROUILLON");
            var enCours = await _context.RecruitmentRequestDetails
                .CountAsync(r => r.RecruitmentRequest != null && r.RecruitmentRequest.Status == "En Cours");
            var approuvees = await _context.RecruitmentRequestDetails
                .CountAsync(r => r.RecruitmentRequest != null && r.RecruitmentRequest.Status == "Approuvé");
            var rejetees = await _context.RecruitmentRequestDetails
                .CountAsync(r => r.RecruitmentRequest != null && r.RecruitmentRequest.Status == "Rejeté");

            return new RecruitmentRequestStats
            {
                Total = total,
                EnAttente = enAttente,
                EnCours = enCours,
                Approuvees = approuvees,
                Rejetees = rejetees
            };
        }
    }
}