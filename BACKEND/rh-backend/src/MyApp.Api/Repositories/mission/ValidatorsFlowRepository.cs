using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.validatorsflow;

namespace MyApp.Api.Repositories.mission
{
    public interface IValidatorsFlowRepository
    {
        Task<(IEnumerable<ValidatorsFlow>, int)> SearchAsync(ValidatorsFlowSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<ValidatorsFlow>> GetAllAsync();
        Task<ValidatorsFlow?> GetByIdAsync(string id);
        Task<IEnumerable<ValidatorsFlow>> GetByUserIdAsync(string userId);
        Task<IEnumerable<ValidatorsFlow>> GetByTypeAndUserAsync(string validatorType, string userId);
        Task<IEnumerable<ValidatorsFlow>> GetByTypeAndSuperiorAsync(string validatorType, string superiorId);
        Task<IEnumerable<ValidatorsFlow>> GetByTypeAndBackupOrderAsync(string validatorType, int backupOrder);
        Task AddAsync(ValidatorsFlow validatorFlow);
        Task UpdateAsync(ValidatorsFlow validatorFlow);
        Task DeleteAsync(string id);
        Task DeleteByUserIdAsync(string userId);
        Task SaveChangesAsync();
        Task<ValidatorsFlow?> GetDirecteurTutelleAsync(string departement,string matricule);
        Task<ValidatorsFlow?> GetDirecteurRHAsync();
    }

    public class ValidatorsFlowRepository : IValidatorsFlowRepository
    {
        private readonly AppDbContext _context;

        public ValidatorsFlowRepository(AppDbContext context)
        {
            _context = context;
        }

        
        public async Task<ValidatorsFlow?> GetDirecteurRHAsync()
        {
            return await _context.ValidatorsFlows
                .Include(v => v.User)
                .Include(v => v.Superior)
                .Where(v => v.ValidatorType == "DRH" && v.BackupOrder == 0) 
                .OrderBy(v => v.BackupOrder)
                .FirstOrDefaultAsync();
        }

        public async Task<ValidatorsFlow?> GetDirecteurTutelleAsync(string department, string matricule)
        {
            var estDirecteurOuDRH = await _context.ValidatorsFlows
                .Include(v => v.User)
                .AnyAsync(v => v.User != null && 
                            v.User.Matricule == matricule && 
                            (v.ValidatorType == "Directeur de tutelle" || v.ValidatorType == "DRH") && 
                            v.Department == department);

            if (estDirecteurOuDRH)
            {
                var directeurOuDRH = await _context.ValidatorsFlows
                    .Include(v => v.User)
                    .FirstOrDefaultAsync(v => v.User != null && 
                                            v.User.Matricule == matricule && 
                                            (v.ValidatorType == "Directeur de tutelle" || v.ValidatorType == "DRH") &&
                                            v.Department == department);

                if (directeurOuDRH != null && directeurOuDRH.SuperiorId != null)
                {
                    var superieur = await _context.ValidatorsFlows
                        .Include(v => v.User)
                        .Include(v => v.Superior)
                        .FirstOrDefaultAsync(v => v.UserId == directeurOuDRH.SuperiorId);

                    return superieur;
                }

                return null;
            }
            else
            {
                string validatorTypeRecherche = (department == "DRH") ? "DRH" : "Directeur de tutelle";

                var directeurOuDRHDepartement = await _context.ValidatorsFlows
                    .Include(v => v.User)
                    .Include(v => v.Superior)
                    .Where(v => v.ValidatorType == validatorTypeRecherche && 
                            v.Department == department)
                    .OrderBy(v => v.BackupOrder)
                    .FirstOrDefaultAsync();

                if (directeurOuDRHDepartement == null && validatorTypeRecherche == "DRH")
                {
                    var directeurTutelleFallback = await _context.ValidatorsFlows
                        .Include(v => v.User)
                        .Include(v => v.Superior)
                        .Where(v => v.ValidatorType == "Directeur de tutelle" && 
                                v.Department == department)
                        .OrderBy(v => v.BackupOrder)
                        .FirstOrDefaultAsync();

                    return directeurTutelleFallback;
                }

                return directeurOuDRHDepartement;
            }
        }
                
        public async Task<(IEnumerable<ValidatorsFlow>, int)> SearchAsync(ValidatorsFlowSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.ValidatorsFlows
                .Include(v => v.User)
                .Include(v => v.Superior)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filters.ValidatorType))
            {
                query = query.Where(v => v.ValidatorType.Contains(filters.ValidatorType));
            }

            if (!string.IsNullOrWhiteSpace(filters.UserId))
            {
                query = query.Where(v => v.UserId == filters.UserId);
            }

            if (!string.IsNullOrWhiteSpace(filters.SuperiorId))
            {
                query = query.Where(v => v.SuperiorId == filters.SuperiorId);
            }

            if (filters.MinBackupOrder.HasValue)
            {
                query = query.Where(v => v.BackupOrder >= filters.MinBackupOrder.Value);
            }

            if (filters.MaxBackupOrder.HasValue)
            {
                query = query.Where(v => v.BackupOrder <= filters.MaxBackupOrder.Value);
            }

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderBy(v => v.ValidatorType)
                .ThenBy(v => v.BackupOrder)
                .ThenBy(v => v.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task<IEnumerable<ValidatorsFlow>> GetAllAsync()
        {
            return await _context.ValidatorsFlows
                .Include(v => v.User)
                .Include(v => v.Superior)
                .OrderBy(v => v.ValidatorType)
                .ThenBy(v => v.BackupOrder)
                .ThenBy(v => v.CreatedAt)
                .ToListAsync();
        }

        public async Task<ValidatorsFlow?> GetByIdAsync(string id)
        {
            return await _context.ValidatorsFlows
                .Include(v => v.User)
                .Include(v => v.Superior)
                .FirstOrDefaultAsync(v => v.ValidatorId == id);
        }

        public async Task<IEnumerable<ValidatorsFlow>> GetByUserIdAsync(string userId)
        {
            return await _context.ValidatorsFlows
                .Include(v => v.User)
                .Include(v => v.Superior)
                .Where(v => v.UserId == userId)
                .OrderBy(v => v.ValidatorType)
                .ThenBy(v => v.BackupOrder)
                .ToListAsync();
        }

        public async Task<IEnumerable<ValidatorsFlow>> GetByTypeAndUserAsync(string validatorType, string userId)
        {
            return await _context.ValidatorsFlows
                .Include(v => v.User)
                .Include(v => v.Superior)
                .Where(v => v.ValidatorType == validatorType && v.UserId == userId)
                .OrderBy(v => v.BackupOrder)
                .ToListAsync();
        }

        public async Task<IEnumerable<ValidatorsFlow>> GetByTypeAndSuperiorAsync(string validatorType, string superiorId)
        {
            return await _context.ValidatorsFlows
                .Include(v => v.User)
                .Include(v => v.Superior)
                .Where(v => v.ValidatorType == validatorType && v.SuperiorId == superiorId)
                .OrderBy(v => v.BackupOrder)
                .ToListAsync();
        }

        public async Task<IEnumerable<ValidatorsFlow>> GetByTypeAndBackupOrderAsync(string validatorType, int backupOrder)
        {
            return await _context.ValidatorsFlows
                .Include(v => v.User)
                .Include(v => v.Superior)
                .Where(v => v.ValidatorType == validatorType && v.BackupOrder == backupOrder)
                .OrderBy(v => v.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(ValidatorsFlow validatorFlow)
        {
            validatorFlow.CreatedAt = DateTime.Now;
            await _context.ValidatorsFlows.AddAsync(validatorFlow);
        }

        public Task UpdateAsync(ValidatorsFlow validatorFlow)
        {
            validatorFlow.UpdatedAt = DateTime.Now;
            _context.ValidatorsFlows.Update(validatorFlow);
            return Task.CompletedTask;
        }

        public async Task DeleteAsync(string id)
        {
            var validatorFlow = await GetByIdAsync(id);
            if (validatorFlow != null)
                _context.ValidatorsFlows.Remove(validatorFlow);
        }

        public async Task DeleteByUserIdAsync(string userId)
        {
            var validators = await _context.ValidatorsFlows
                .Where(v => v.UserId == userId)
                .ToListAsync();
            
            if (validators.Any())
                _context.ValidatorsFlows.RemoveRange(validators);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}