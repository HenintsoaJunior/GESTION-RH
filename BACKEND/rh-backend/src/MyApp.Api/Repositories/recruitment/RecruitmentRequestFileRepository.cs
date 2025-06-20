<<<<<<< HEAD
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
=======
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using Microsoft.EntityFrameworkCore;

>>>>>>> dev

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentRequestFileRepository
    {
<<<<<<< HEAD
        Task<IEnumerable<RecruitmentRequestFile>> GetAllAsync();
        Task<RecruitmentRequestFile?> GetByIdAsync(string id);
        Task AddAsync(RecruitmentRequestFile file);
        Task SaveChangesAsync();
    }

=======
        Task AddAsync(RecruitmentRequestFile file);
        Task<IEnumerable<RecruitmentRequestFile>> GetByRequestIdAsync(string requestId);
        Task SaveChangesAsync();
    }
>>>>>>> dev
    public class RecruitmentRequestFileRepository : IRecruitmentRequestFileRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentRequestFileRepository(AppDbContext context)
        {
            _context = context;
        }

<<<<<<< HEAD
        public async Task<IEnumerable<RecruitmentRequestFile>> GetAllAsync()
        {
            return await _context.RecruitmentRequestFiles.ToListAsync();
        }

        public async Task<RecruitmentRequestFile?> GetByIdAsync(string id)
        {
            return await _context.RecruitmentRequestFiles.FindAsync(id);
        }

=======
>>>>>>> dev
        public async Task AddAsync(RecruitmentRequestFile file)
        {
            await _context.RecruitmentRequestFiles.AddAsync(file);
        }

<<<<<<< HEAD
=======
        public async Task<IEnumerable<RecruitmentRequestFile>> GetByRequestIdAsync(string requestId)
        {
            return await _context.RecruitmentRequestFiles
                .Where(f => f.RecruitmentRequestId == requestId)
                .ToListAsync();
        }

>>>>>>> dev
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> dev
