using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentRequestRepository
    {
        Task<IEnumerable<RecruitmentRequest>> GetAllAsync();
        Task<RecruitmentRequest?> GetByRequestIdAsync(string requestId);
        Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAsync(string requesterId);
        Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAndValidatedAsync(string requesterId);
        Task AddAsync(RecruitmentRequest request);
        Task UpdateAsync(RecruitmentRequest request);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
        Task ReloadAsync(RecruitmentRequest request);
    }

    public class RecruitmentRequestRepository : IRecruitmentRequestRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetAllAsync()
        {
            return await _context.RecruitmentRequests
                .Include(r => r.Requester)
                .Include(r => r.ContractType)
                .Include(r => r.Site)
                .Include(r => r.RecruitmentReason)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<RecruitmentRequest?> GetByRequestIdAsync(string requestId)
        {
            return await _context.RecruitmentRequests
                .Include(r => r.Requester)
                .Include(r => r.ContractType)
                .Include(r => r.Site)
                .Include(r => r.RecruitmentReason)
                .FirstOrDefaultAsync(r => r.RecruitmentRequestId == requestId);
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAsync(string requesterId)
        {
            return await _context.RecruitmentRequests
                .Where(r => r.RequesterId == requesterId)
                .Include(r => r.Requester)
                .Include(r => r.ContractType)
                .Include(r => r.Site)
                .Include(r => r.RecruitmentReason)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAndValidatedAsync(string requesterId)
        {
            return await _context.RecruitmentRequests
                .Where(r => r.RequesterId == requesterId && r.Status.ToLower() == "validé")
                .Include(r => r.Requester)
                .Include(r => r.ContractType)
                .Include(r => r.Site)
                .Include(r => r.RecruitmentReason)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(RecruitmentRequest request)
        {
            await _context.RecruitmentRequests.AddAsync(request);
        }

        public async Task UpdateAsync(RecruitmentRequest request)
        {
            _context.RecruitmentRequests.Update(request);
            await _context.SaveChangesAsync(); // Ensure changes are saved
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await GetByRequestIdAsync(id);
            if (entity != null)
            {
                _context.RecruitmentRequests.Remove(entity);
                await _context.SaveChangesAsync(); // Ensure changes are saved
            }
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task ReloadAsync(RecruitmentRequest request)
        {
            await _context.Entry(request).ReloadAsync();
        }
    }
}