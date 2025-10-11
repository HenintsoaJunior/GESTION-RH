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
        Task<(IEnumerable<MissionValidation>, int)> GetRequestAsync(string userId, int page, int pageSize, string? employeeId = null, string? status = null);
        Task<bool> ValidateAsync(string missionValidationId, string missionAssignationId);
        Task<(IEnumerable<MissionValidation>, int)> SearchAsync(MissionValidationSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<MissionValidation>> GetAllAsync();
        Task<IEnumerable<MissionValidation?>?> GetByAssignationIdAsync(string assignationId);
        Task<MissionValidation?> GetByIdAsync(string id);
        Task AddAsync(MissionValidation missionValidation);
        Task UpdateAsync(MissionValidation missionValidation);
        Task DeleteAsync(MissionValidation missionValidation);
        Task SaveChangesAsync();
        Task<bool> UpdateStatusAsync(string id, string status);
        Task<IEnumerable<MissionValidation>> GetByMissionIdAsync(string missionId);
        Task<bool> RejectedAsync(string missionValidationId, string missionAssignationId);
        Task<MissionStatsValidation> GetStatisticsAsync(string? matricule = null);
    }

    public class MissionValidationRepository : IMissionValidationRepository
    {
        private readonly AppDbContext _context;

        public MissionValidationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }


        public async Task<IEnumerable<MissionValidation>> GetByMissionIdAsync(string missionId)
        {
            if (string.IsNullOrWhiteSpace(missionId))
            {
                return [];
            }

            return await _context.MissionValidations
                .Where(mv => mv.MissionId == missionId)
                .Include(mv => mv.Creator)
                .Include(mv => mv.Validator)
                .OrderBy(mv => mv.CreatedAt)
                .ToListAsync();
        }

        public async Task<(IEnumerable<MissionValidation>, int)> GetRequestAsync(string userId, int page, int pageSize, string? employeeId = null, string? status = null)
        {
            var query = _context.MissionValidations
                .Include(mv => mv.Mission)
#pragma warning disable CS8602
                .ThenInclude(m => m.Lieu)
#pragma warning restore CS8602
                .Include(mv => mv.MissionAssignation)
                .Include(mv => mv.Creator)
                .Include(mv => mv.Validator)
                .Where(mv => mv.ToWhom == userId)
                .Where(mv => mv.Status != "cancel")
                .Where(mv => mv.Status != null)
                .AsQueryable();

            // Filtre sur EmployeeId (via MissionAssignation)
            if (!string.IsNullOrWhiteSpace(employeeId))
            {
                query = query
                    .Join(
                        _context.MissionAssignations,
                        mv => mv.MissionAssignationId,
                        ma => ma.AssignationId,
                        (mv, ma) => new { MissionValidation = mv, MissionAssignation = ma }
                    )
                    .Where(x => x.MissionAssignation.EmployeeId == employeeId)
                    .Select(x => x.MissionValidation);
            }

            // Filtre sur Status
            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(mv => mv.Status == status);
            }

            // Compter le nombre total d'éléments après application des filtres
            var totalCount = await query.CountAsync();

            // Appliquer la pagination
            var results = await query
                .OrderByDescending(mv => mv.ValidationDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }


        public async Task<bool> RejectedAsync(string missionValidationId, string missionAssignationId)
        {
            var missionValidation = await _context.MissionValidations
                .FirstOrDefaultAsync(mv => mv.MissionValidationId == missionValidationId
                                           && mv.MissionAssignationId == missionAssignationId);

            if (missionValidation == null)
            {
                return false;
            }

            missionValidation.Status = "rejected";
            missionValidation.ValidationDate = DateTime.UtcNow;
            missionValidation.UpdatedAt = DateTime.UtcNow;

            _context.MissionValidations.Update(missionValidation);
            await _context.SaveChangesAsync();
            return true;
        }
        //valider une demande 
        public async Task<bool> ValidateAsync(string missionValidationId, string missionAssignationId)
        {
            var missionValidation = await _context.MissionValidations
                .FirstOrDefaultAsync(mv => mv.MissionValidationId == missionValidationId
                                           && mv.MissionAssignationId == missionAssignationId);

            // Valider la ligne courante
            if (missionValidation != null)
            {
                missionValidation.Status = "approved";
                missionValidation.ValidationDate = DateTime.UtcNow;
                _context.MissionValidations.Update(missionValidation);
            }

            // Chercher la prochaine ligne pour ce MissionAssignationId
            var isFinished = true;
            var nextValidation = await _context.MissionValidations
                .Where(mv => mv.MissionAssignationId == missionAssignationId && mv.Status == null)
                .OrderBy(mv => mv.CreatedAt) // ordre logique (ex : chronologique)
                .FirstOrDefaultAsync();

            if (nextValidation != null)
            {
                nextValidation.Status = "pending";
                _context.MissionValidations.Update(nextValidation);
                isFinished = false;
            }

            await _context.SaveChangesAsync();
            return isFinished;
        }


        public async Task<(IEnumerable<MissionValidation>, int)> SearchAsync(MissionValidationSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.MissionValidations
                .Include(mv => mv.Mission)
                .Include(mv => mv.MissionAssignation)
                .Include(mv => mv.Creator)
                .Include(mv => mv.Validator)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.MissionId))
            {
                query = query.Where(mv => mv.MissionId == filters.MissionId);
            }

            if (!string.IsNullOrWhiteSpace(filters.MissionAssignationId))
            {
                query = query.Where(mv => mv.MissionAssignationId == filters.MissionAssignationId);
            }

            if (!string.IsNullOrWhiteSpace(filters.MissionCreator))
            {
                query = query.Where(mv => mv.MissionCreator == filters.MissionCreator);
            }

            if (!string.IsNullOrWhiteSpace(filters.Status))
            {
                query = query.Where(mv => mv.Status != null && mv.Status.Contains(filters.Status));
            }

            if (!string.IsNullOrWhiteSpace(filters.ToWhom))
            {
                query = query.Where(mv => mv.ToWhom == filters.ToWhom);
            }

            if (filters.ValidationDate.HasValue)
            {
                query = query.Where(mv => mv.ValidationDate >= filters.ValidationDate.Value);
            }

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
                .Include(mv => mv.MissionAssignation)
                .Include(mv => mv.Creator)
                .Include(mv => mv.Validator)
                .OrderByDescending(mv => mv.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<MissionValidation?>?> GetByAssignationIdAsync(string? assignationId)
        {
            if (string.IsNullOrEmpty(assignationId))
            {
                return null;
            }

            var missionValidations = await _context.MissionValidations
                .Include(mv => mv.Validator)
                .Include(mv => mv.MissionAssignation)
                .Where(mv => mv.MissionAssignationId == assignationId)
                .OrderByDescending(mv => mv.CreatedAt)
                .ToListAsync();
            return missionValidations;
        }

        public async Task<MissionValidation?> GetByIdAsync(string id)
        {
            return await _context.MissionValidations
                .AsNoTracking()
                .Include(mv => mv.Mission)
                .Include(mv => mv.MissionAssignation)
                .Include(mv => mv.Creator)
                .Include(mv => mv.Validator)
                .FirstOrDefaultAsync(mv => mv.MissionValidationId == id);
        }

        public async Task AddAsync(MissionValidation missionValidation)
        {
            await _context.MissionValidations.AddAsync(missionValidation);
        }

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
        {
            await _context.SaveChangesAsync();
        }

        public async Task<bool> UpdateStatusAsync(string id, string status)
        {
            var missionValidation = await _context.MissionValidations
                .FirstOrDefaultAsync(mv => mv.MissionValidationId == id);
            if (missionValidation == null) return false;

            missionValidation.Status = status;
            missionValidation.ValidationDate = DateTime.UtcNow;
            _context.MissionValidations.Update(missionValidation);
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

            return new MissionStatsValidation
            {
                Total = await query.CountAsync(),
                EnAttente = stats.GetValueOrDefault("pending", 0),
                Approuvee = stats.GetValueOrDefault("approved", 0),
                Rejetee = stats.GetValueOrDefault("rejected", 0)
            };
        }
    }
}