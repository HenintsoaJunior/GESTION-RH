// ===== REPOSITORY INTERFACE =====
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
        Task ReloadAsync(RecruitmentRequest request); // NOUVELLE MÉTHODE
    }

    // ===== REPOSITORY IMPLEMENTATION =====
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
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<RecruitmentRequest?> GetByRequestIdAsync(string requestId)
        {
            return await _context.RecruitmentRequests
                .FirstOrDefaultAsync(r => r.RecruitmentRequestId == requestId);
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAsync(string requesterId)
        {
            return await _context.RecruitmentRequests
                .Where(r => r.RequesterId == requesterId)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<RecruitmentRequest>> GetByRequesterIdAndValidatedAsync(string requesterId)
        {
            return await _context.RecruitmentRequests
                .Where(r => r.RequesterId == requesterId && r.Status.ToLower() == "validé")
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(RecruitmentRequest request)
        {
            await _context.RecruitmentRequests.AddAsync(request);
        }

        public Task UpdateAsync(RecruitmentRequest request)
        {
            _context.RecruitmentRequests.Update(request);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await GetByRequestIdAsync(id);
            if (entity != null)
            {
                _context.RecruitmentRequests.Remove(entity);
            }
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        // NOUVELLE MÉTHODE - Recharge l'entité depuis la base de données
        public async Task ReloadAsync(RecruitmentRequest request)
        {
            await _context.Entry(request).ReloadAsync();
        }
    }
}
