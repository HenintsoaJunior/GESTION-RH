using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IMissionValidationRepository
    {
        Task<IEnumerable<MissionValidation>> GetRequestAsync();
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
    }

    public class MissionValidationRepository : IMissionValidationRepository
    {
        private readonly AppDbContext _context;

        public MissionValidationRepository(AppDbContext context)
        {
            _context = context;
        }
        
        //prendre les demandes validations
        public async Task<IEnumerable<MissionValidation>> GetRequestAsync()
        {
            return await _context.MissionValidations
                .Include(mv => mv.Mission)
                .Include(mv => mv.MissionAssignation)
                .Include(mv => mv.User)
                .Where(mv => mv.Status == "En Attente")
                .OrderByDescending(mv => mv.ValidationDate)
                .ToListAsync();
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
                missionValidation.Status = "Validé";
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
                nextValidation.Status = "En Attente";
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
                .Include(mv => mv.User)
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
                .Include(mv => mv.User)
                .OrderByDescending(mv => mv.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<MissionValidation?>?> GetByAssignationIdAsync(string assignationId)
        {
            return await _context.MissionValidations
                .Where(mv => mv.MissionAssignationId == assignationId)
                .OrderByDescending(mv => mv.CreatedAt)
                .ToListAsync();
        }

        public async Task<MissionValidation?> GetByIdAsync(string id)
        {
            return await _context.MissionValidations
                .AsNoTracking()
                .Include(mv => mv.Mission)
                .Include(mv => mv.MissionAssignation)
                .Include(mv => mv.User)
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
    }
}