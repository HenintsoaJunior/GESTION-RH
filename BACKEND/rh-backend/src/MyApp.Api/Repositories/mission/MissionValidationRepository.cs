using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.list.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IMissionValidationRepository
    {
        Task<IDbContextTransaction> BeginTransactionAsync();
        Task<(IEnumerable<MissionValidation>, int)> GetRequestAsync(string userId, int page, int pageSize, RequestFilterDto requestFilterDto);
        Task<bool> ValidateAsync(string missionValidationId);
        Task<bool> RejectedAsync(string missionValidationId);  
        Task<(IEnumerable<MissionValidation>, int)> SearchAsync(MissionValidationSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<MissionValidation>> GetAllAsync();
        Task<MissionValidation?> GetByIdAsync(string id);
        Task AddAsync(MissionValidation missionValidation);
        Task UpdateAsync(MissionValidation missionValidation);
        Task DeleteAsync(MissionValidation missionValidation);
        Task SaveChangesAsync();
        Task<bool> UpdateStatusAsync(string id, string status);
        Task<IEnumerable<MissionValidation>> GetByMissionIdAsync(string missionId);
        Task<MissionStatsValidation> GetStatisticsAsync(string? matricule = null);
        Task<bool> HasValidationLineAsync(string userId);
        Task<int> GetPendingMissionsCountAsync();
        Task<(double Rate, DateTime Date)> GetValidationRateAsync();
    }

    public class MissionValidationRepository : IMissionValidationRepository
    {
        private readonly AppDbContext _context;

        public MissionValidationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
            => await _context.Database.BeginTransactionAsync();

        public async Task<bool> HasValidationLineAsync(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId)) return false;

            return await _context.MissionValidations
                .AnyAsync(mv => mv.ToWhom == userId && mv.Status != "cancel" && mv.Status != "Annulé");
        }

        public async Task<IEnumerable<MissionValidation>> GetByMissionIdAsync(string missionId)
        {
            if (string.IsNullOrWhiteSpace(missionId)) return Enumerable.Empty<MissionValidation>();

            return await _context.MissionValidations
                .Where(mv => mv.MissionId == missionId)
                .Include(mv => mv.Creator)
                .Include(mv => mv.Validator)
                .Include(mv => mv.Mission)
                    .ThenInclude(m => m!.Lieu)
                .Include(mv => mv.Mission)
                    .ThenInclude(m => m!.Employee)
                .OrderBy(mv => mv.CreatedAt)
                .ToListAsync();
        }

        public async Task<(IEnumerable<MissionValidation>, int)> GetRequestAsync(string userId, int page, int pageSize, RequestFilterDto requestFilterDto)
        {
            var query = _context.MissionValidations
                .Include(mv => mv.Mission)
                    .ThenInclude(m => m!.Lieu)
                .Include(mv => mv.Mission)
                    .ThenInclude(m => m!.Employee)
                .Include(mv => mv.Creator)
                .Include(mv => mv.Validator)
                .Where(mv => mv.ToWhom == userId && mv.Status != "cancel" && mv.Status != "Annulé");

            if (!string.IsNullOrWhiteSpace(requestFilterDto.EmployeeId))
            {
                query = query.Where(mv => mv.Mission!.EmployeeId == requestFilterDto.EmployeeId);
            }

            if (!string.IsNullOrWhiteSpace(requestFilterDto.Status))
            {
                query = query.Where(mv => mv.Status == requestFilterDto.Status);
            }
            if (!string.IsNullOrWhiteSpace(requestFilterDto.EmployeeMatricule))
            {
                query = query.Where(mv => mv.Mission!.Employee!.EmployeeCode != null && 
                                          mv.Mission.Employee.EmployeeCode.Contains(requestFilterDto.EmployeeMatricule));
            }

            if (DateTime.TryParse(requestFilterDto.ValidationDateFrom, out var fromValDate))
                query = query.Where(mv => mv.ValidationDate >= fromValDate);

            if (DateTime.TryParse(requestFilterDto.ValidationDateTo, out var toValDate))
                query = query.Where(mv => mv.ValidationDate <= toValDate);

            if (DateTime.TryParse(requestFilterDto.RequestDateFrom, out var fromReqDate))
                query = query.Where(mv => mv.Mission!.CreatedAt >= fromReqDate);

            if (DateTime.TryParse(requestFilterDto.RequestDateTo, out var toReqDate))
                query = query.Where(mv => mv.Mission!.CreatedAt <= toReqDate);

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderByDescending(mv => mv.ValidationDate ?? mv.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task<bool> RejectedAsync(string missionValidationId)
        {
            var validation = await _context.MissionValidations
                .FirstOrDefaultAsync(mv => mv.MissionValidationId == missionValidationId);

            if (validation == null) return false;

            validation.Status = "rejected";
            validation.ValidationDate = DateTime.UtcNow;
            validation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ValidateAsync(string missionValidationId)
        {
            var current = await _context.MissionValidations
                .FirstOrDefaultAsync(mv => mv.MissionValidationId == missionValidationId);

            if (current == null)
            {
                return false;
            }
            
            
            // Marquer la ligne courante comme validée
            current.Status = "approved";
            current.ValidationDate = DateTime.UtcNow;
            current.UpdatedAt = DateTime.UtcNow;
            var hasPending = await _context.MissionValidations
                .AnyAsync(mv => mv.MissionId == current.MissionId && 
                            mv.MissionValidationId != missionValidationId && // Exclure la validation courante
                            (mv.Status == null || mv.Status == "pending"));
            
            var isFinished = !hasPending;
            
            await _context.SaveChangesAsync();
            
            return isFinished;
        }

        public async Task<(IEnumerable<MissionValidation>, int)> SearchAsync(MissionValidationSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.MissionValidations
                .Include(mv => mv.Mission)
                    .ThenInclude(m => m!.Lieu)
                .Include(mv => mv.Mission)
                    .ThenInclude(m => m!.Employee)
                .Include(mv => mv.Creator)
                .Include(mv => mv.Validator)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.MissionId))
                query = query.Where(mv => mv.MissionId == filters.MissionId);

            if (!string.IsNullOrWhiteSpace(filters.MissionCreator))
                query = query.Where(mv => mv.MissionCreator == filters.MissionCreator);

            if (!string.IsNullOrWhiteSpace(filters.Status))
                query = query.Where(mv => mv.Status != null && mv.Status.Contains(filters.Status, StringComparison.OrdinalIgnoreCase));

            if (!string.IsNullOrWhiteSpace(filters.ToWhom))
                query = query.Where(mv => mv.ToWhom == filters.ToWhom);

            if (filters.ValidationDate.HasValue)
                query = query.Where(mv => mv.ValidationDate >= filters.ValidationDate.Value);

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderByDescending(mv => mv.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task<IEnumerable<MissionValidation>> GetAllAsync()
        {
            return await _context.MissionValidations
                .Include(mv => mv.Mission)
                    .ThenInclude(m => m!.Lieu)
                .Include(mv => mv.Mission)
                    .ThenInclude(m => m!.Employee)
                .Include(mv => mv.Creator)
                .Include(mv => mv.Validator)
                .OrderByDescending(mv => mv.CreatedAt)
                .ToListAsync();
        }

        public async Task<MissionValidation?> GetByIdAsync(string id)
        {
            return await _context.MissionValidations
                .Include(mv => mv.Mission)
                    .ThenInclude(m => m!.Lieu)
                .Include(mv => mv.Mission)
                    .ThenInclude(m => m!.Employee)
                .Include(mv => mv.Creator)
                .Include(mv => mv.Validator)
                .AsNoTracking()
                .FirstOrDefaultAsync(mv => mv.MissionValidationId == id);
        }

        public async Task AddAsync(MissionValidation missionValidation)
            => await _context.MissionValidations.AddAsync(missionValidation);

        public Task UpdateAsync(MissionValidation missionValidation)
        {
            _context.MissionValidations.Update(missionValidation);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(MissionValidation missionValidation)
        {
            _context.MissionValidations.Remove(missionValidation);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
            => await _context.SaveChangesAsync();

        public async Task<bool> UpdateStatusAsync(string id, string status)
        {
            var validation = await _context.MissionValidations
                .FirstOrDefaultAsync(mv => mv.MissionValidationId == id);

            if (validation == null) return false;

            validation.Status = status;
            validation.ValidationDate = DateTime.UtcNow;
            validation.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<MissionStatsValidation> GetStatisticsAsync(string? matricule = null)
        {
            var query = _context.MissionValidations.AsQueryable();

            if (!string.IsNullOrWhiteSpace(matricule))
            {
                query = query.Where(mv => mv.Validator != null && mv.Validator.Matricule == matricule);
            }

            var stats = await query
                .GroupBy(mv => mv.Status ?? "null")
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Status, g => g.Count);

            var total = await query.CountAsync();

            return new MissionStatsValidation
            {
                Total = total,
                EnAttente = stats.GetValueOrDefault("pending", 0),
                Approuvee = stats.GetValueOrDefault("approved", 0),
                Rejetee = stats.GetValueOrDefault("rejected", 0)
            };
        }

        public async Task<int> GetPendingMissionsCountAsync()
        {
            return await _context.MissionValidations
                .Where(mv => mv.Status == "pending" || mv.Status == null)
                .Select(mv => mv.MissionId)
                .Distinct()
                .CountAsync();
        }

        public async Task<(double Rate, DateTime Date)> GetValidationRateAsync()
        {
            var latestDate = await _context.MissionValidations
                .Where(mv => mv.ValidationDate.HasValue)
                .MaxAsync(mv => (DateTime?)mv.ValidationDate) ?? DateTime.UtcNow;

            var validated = _context.MissionValidations
                .Where(mv => mv.ValidationDate <= latestDate && mv.Status != null && mv.Status != "cancel" && mv.Status != "Annulé");

            var approved = await validated.CountAsync(mv => mv.Status == "approved");
            var rejected = await validated.CountAsync(mv => mv.Status == "rejected");
            var total = approved + rejected;

            var rate = total > 0 ? (double)approved / total * 100 : 0;

            return (rate, latestDate);
        }
    }
}