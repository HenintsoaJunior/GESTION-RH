using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentRequestDetailRepository
    {
        Task<IEnumerable<RecruitmentRequestDetail>> GetAllAsync();
        Task<RecruitmentRequestDetail?> GetByIdAsync(string id);
        Task<IEnumerable<RecruitmentRequestDetail>> GetByRequestIdAsync(string recruitmentRequestId);
        Task AddAsync(RecruitmentRequestDetail detail);
        Task UpdateAsync(RecruitmentRequestDetail detail);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
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
                .ToListAsync();
        }

        public async Task AddAsync(RecruitmentRequestDetail detail)
        {
            await _context.RecruitmentRequestDetails.AddAsync(detail);
        }

        public Task UpdateAsync(RecruitmentRequestDetail detail)
        {
            _context.RecruitmentRequestDetails.Update(detail);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var detail = await GetByIdAsync(id);
            if (detail != null)
                _context.RecruitmentRequestDetails.Remove(detail);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
