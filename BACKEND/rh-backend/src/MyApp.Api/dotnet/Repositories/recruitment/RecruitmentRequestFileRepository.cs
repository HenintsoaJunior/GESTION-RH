using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using Microsoft.EntityFrameworkCore;


namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentRequestFileRepository
    {
        Task AddAsync(RecruitmentRequestFile file);
        Task<IEnumerable<RecruitmentRequestFile>> GetByRequestIdAsync(string requestId);
        Task SaveChangesAsync();
    }
    public class RecruitmentRequestFileRepository : IRecruitmentRequestFileRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentRequestFileRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(RecruitmentRequestFile file)
        {
            await _context.RecruitmentRequestFiles.AddAsync(file);
        }

        public async Task<IEnumerable<RecruitmentRequestFile>> GetByRequestIdAsync(string requestId)
        {
            return await _context.RecruitmentRequestFiles
                .Where(f => f.RecruitmentRequestId == requestId)
                .ToListAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
