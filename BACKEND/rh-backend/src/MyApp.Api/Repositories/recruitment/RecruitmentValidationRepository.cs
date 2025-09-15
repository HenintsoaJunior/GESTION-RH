using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MyApp.Api.Data;
using MyApp.Api.Entities.recruitment;
using static MyApp.Api.Models.dto.recruitment.RecruitmentValidationDTO;

namespace MyApp.Api.Repositories.recruitment
{
    public interface IRecruitmentValidationRepository
    {
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<(IEnumerable<RecruitmentValidation>, int)> GetRequestAsync(string userId, int page, int pageSize);
        Task<bool> ValidateAsync(string recruitmentValidationId, string recruitmentRequestId);
        Task<(IEnumerable<RecruitmentValidation>, int)> SearchAsync(RecruitmentValidationSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<RecruitmentValidation>> GetAllAsync();
        Task<IEnumerable<RecruitmentValidation?>?> GetByRequestIdAsync(string recruitmentRequestId);
        Task<RecruitmentValidation?> GetByIdAsync(string id);
        Task AddAsync(RecruitmentValidation recruitmentValidation);
        Task UpdateAsync(RecruitmentValidation recruitmentValidation);
        Task DeleteAsync(RecruitmentValidation recruitmentValidation);
        Task SaveChangesAsync();
        Task<bool> UpdateStatusAsync(string id, string status);
    }

    public class RecruitmentValidationRepository : IRecruitmentValidationRepository
    {
        private readonly AppDbContext _context;

        public RecruitmentValidationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }

        public async Task<(IEnumerable<RecruitmentValidation>, int)> GetRequestAsync(string userId, int page, int pageSize)
        {
            var query = _context.RecruitmentValidations
                .Include(rv => rv.RecruitmentRequest)
                .Include(rv => rv.Creator)
                .Include(rv => rv.Validator)
                .Where(rv => rv.ToWhom == userId)
                .Where(rv => rv.Status == "En attente")
                .AsQueryable();
            var totalCount = await query.CountAsync();
            var results = await query
                .OrderByDescending(rv => rv.ValidationDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return (results, totalCount);
        }

        public async Task<bool> ValidateAsync(string recruitmentValidationId, string recruitmentRequestId)
        {
            var recruitmentValidation = await _context.RecruitmentValidations
                .FirstOrDefaultAsync(rv => rv.RecruitmentValidationId == recruitmentValidationId
                                           && rv.RecruitmentRequestId == recruitmentRequestId);

            if (recruitmentValidation != null)
            {
                recruitmentValidation.Status = "Validé";
                recruitmentValidation.ValidationDate = DateTime.UtcNow;
                _context.RecruitmentValidations.Update(recruitmentValidation);
            }

            var isFinished = true;
            var nextValidation = await _context.RecruitmentValidations
                .Where(rv => rv.RecruitmentRequestId == recruitmentRequestId && rv.Status == null)
                .OrderBy(rv => rv.CreatedAt)
                .FirstOrDefaultAsync();
            if (nextValidation != null)
            {
                nextValidation.Status = "En attente";
                _context.RecruitmentValidations.Update(nextValidation);
                isFinished = false;
            }
            await _context.SaveChangesAsync();
            return isFinished;
        }

        public async Task<(IEnumerable<RecruitmentValidation>, int)> SearchAsync(RecruitmentValidationSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.RecruitmentValidations
                .Include(rv => rv.RecruitmentRequest)
                .Include(rv => rv.Creator)
                .Include(rv => rv.Validator)
                .AsQueryable();
            if (!string.IsNullOrWhiteSpace(filters.RecruitmentRequestId))
            {
                query = query.Where(rv => rv.RecruitmentRequestId == filters.RecruitmentRequestId);
            }
            if (!string.IsNullOrWhiteSpace(filters.RecruitmentCreator))
            {
                query = query.Where(rv => rv.RecruitmentCreator == filters.RecruitmentCreator);
            }
            if (!string.IsNullOrWhiteSpace(filters.Status))
            {
                query = query.Where(rv => rv.Status != null && rv.Status.Contains(filters.Status));
            }
            if (!string.IsNullOrWhiteSpace(filters.ToWhom))
            {
                query = query.Where(rv => rv.ToWhom == filters.ToWhom);
            }
            if (filters.ValidationDate.HasValue)
            {
                query = query.Where(rv => rv.ValidationDate >= filters.ValidationDate.Value);
            }
            var totalCount = await query.CountAsync();
            var results = await query
                .OrderByDescending(rv => rv.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return (results, totalCount);
        }

        public async Task<IEnumerable<RecruitmentValidation>> GetAllAsync()
        {
            return await _context.RecruitmentValidations
                .Include(rv => rv.RecruitmentRequest)
                .Include(rv => rv.Creator)
                .Include(rv => rv.Validator)
                .OrderByDescending(rv => rv.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<RecruitmentValidation?>?> GetByRequestIdAsync(string? recruitmentRequestId)
        {
            if (string.IsNullOrEmpty(recruitmentRequestId))
            {
                return null;
            }
            var recruitmentValidations = await _context.RecruitmentValidations
                .Include(rv => rv.Validator)
                .Include(rv => rv.RecruitmentRequest)
                .Where(rv => rv.RecruitmentRequestId == recruitmentRequestId)
                .OrderByDescending(rv => rv.CreatedAt)
                .ToListAsync();
            return recruitmentValidations;
        }

        public async Task<RecruitmentValidation?> GetByIdAsync(string id)
        {
            return await _context.RecruitmentValidations
                .AsNoTracking()
                .Include(rv => rv.RecruitmentRequest)
                .Include(rv => rv.Creator)
                .Include(rv => rv.Validator)
                .FirstOrDefaultAsync(rv => rv.RecruitmentValidationId == id);
        }

        public async Task AddAsync(RecruitmentValidation recruitmentValidation)
        {
            await _context.RecruitmentValidations.AddAsync(recruitmentValidation);
        }

        public Task UpdateAsync(RecruitmentValidation recruitmentValidation)
        {
            _context.RecruitmentValidations.Update(recruitmentValidation);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(RecruitmentValidation recruitmentValidation)
        {
            _context.RecruitmentValidations.Remove(recruitmentValidation);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateStatusAsync(string id, string status)
        {
            var recruitmentValidation = await _context.RecruitmentValidations
                .FirstOrDefaultAsync(rv => rv.RecruitmentValidationId == id);
            if (recruitmentValidation == null) return false;
            recruitmentValidation.Status = status;
            recruitmentValidation.ValidationDate = DateTime.UtcNow;
            _context.RecruitmentValidations.Update(recruitmentValidation);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}