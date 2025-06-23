using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;


namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentRequestFileRepository
    {
        Task<IEnumerable<RecruitmentRequestFile>> GetAllAsync();
        Task<RecruitmentRequestFile?> GetByIdAsync(string id);
        Task<IEnumerable<RecruitmentRequestFile>> GetFilesByRecruitmentRequestIdAsync(string recruitmentRequestId);
        Task AddAsync(RecruitmentRequestFile file);
        Task SaveChangesAsync();
    }


    public class RecruitmentRequestFileRepository : IRecruitmentRequestFileRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentRequestFileRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RecruitmentRequestFile>> GetAllAsync()
        {
            return await _context.RecruitmentRequestFiles.ToListAsync();
        }

        public async Task<RecruitmentRequestFile?> GetByIdAsync(string id)
        {
            return await _context.RecruitmentRequestFiles.FindAsync(id);
        }

        public async Task<IEnumerable<RecruitmentRequestFile>> GetFilesByRecruitmentRequestIdAsync(string recruitmentRequestId)
        {
            return await _context.RecruitmentRequestFiles
                .Where(f => f.RecruitmentRequestId == recruitmentRequestId)
                .ToListAsync();
        }

        public async Task AddAsync(RecruitmentRequestFile file)
        {
            await _context.RecruitmentRequestFiles.AddAsync(file);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
