using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.candidates;

namespace MyApp.Api.Repositories.candidates
{
    public interface ICandidateRepository
    {
        Task<IEnumerable<Candidate>> GetAllByCriteriaAsync(Candidate criteria);
        Task<IEnumerable<Candidate>> GetAllAsync();
        Task<Candidate?> GetByIdAsync(string id);
        Task AddAsync(Candidate candidate);
        Task UpdateAsync(Candidate candidate);
        Task DeleteAsync(Candidate candidate);
        Task SaveChangesAsync();
    }

    public class CandidateRepository : ICandidateRepository
    {
        private readonly AppDbContext _context;

        public CandidateRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Candidate>> GetAllByCriteriaAsync(Candidate criteria)
        {
            var query = _context.Candidates.AsQueryable();

            if (!string.IsNullOrWhiteSpace(criteria.LastName))
                query = query.Where(c => c.LastName.Contains(criteria.LastName));

            if (!string.IsNullOrWhiteSpace(criteria.FirstName))
                query = query.Where(c => c.FirstName.Contains(criteria.FirstName));

            if (!string.IsNullOrWhiteSpace(criteria.Email))
                query = query.Where(c => c.Email == criteria.Email);

            if (criteria.BirthDate.HasValue)
                query = query.Where(c => c.BirthDate == criteria.BirthDate);

            return await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
        }

        public async Task<IEnumerable<Candidate>> GetAllAsync()
        {
            return await _context.Candidates
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Candidate?> GetByIdAsync(string id)
        {
            return await _context.Candidates
                .FirstOrDefaultAsync(c => c.CandidateId == id);
        }

        public async Task AddAsync(Candidate candidate)
        {
            await _context.Candidates.AddAsync(candidate);
        }

        public Task UpdateAsync(Candidate candidate)
        {
            _context.Candidates.Update(candidate);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Candidate candidate)
        {
            _context.Candidates.Remove(candidate);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
