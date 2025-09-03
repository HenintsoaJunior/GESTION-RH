using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentReasonRepository
    {
        Task<IEnumerable<RecruitmentReason>> GetAllAsync();
        Task<RecruitmentReason?> GetByIdAsync(string id);
        Task AddAsync(RecruitmentReason reason);
        Task UpdateAsync(RecruitmentReason reason);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }

    public class RecruitmentReasonRepository : IRecruitmentReasonRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentReasonRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RecruitmentReason>> GetAllAsync()
        {
            return await _context.RecruitmentReasons
                .OrderBy(r => r.Name)
                .ToListAsync();
        }

        public async Task<RecruitmentReason?> GetByIdAsync(string id)
        {
            return await _context.RecruitmentReasons.FindAsync(id);
        }

        public async Task AddAsync(RecruitmentReason reason)
        {
            await _context.RecruitmentReasons.AddAsync(reason);
        }

        public Task UpdateAsync(RecruitmentReason reason)
        {
            _context.RecruitmentReasons.Update(reason);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var existing = await GetByIdAsync(id);
            if (existing != null)
                _context.RecruitmentReasons.Remove(existing);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
