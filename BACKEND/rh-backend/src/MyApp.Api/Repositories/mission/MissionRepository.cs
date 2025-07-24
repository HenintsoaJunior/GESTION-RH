using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.list.mission;
using MyApp.Api.Models.search.mission;

namespace MyApp.Api.Repositories.mission
{
    public interface IMissionRepository
    {
        Task<(IEnumerable<Mission>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize);
        Task<IEnumerable<Mission>> GetAllAsync();
        Task<Mission?> GetByIdAsync(string id);
        Task AddAsync(Mission mission);
        Task UpdateAsync(Mission mission);
        Task DeleteAsync(Mission mission);
        Task SaveChangesAsync();
        Task<MissionStats> GetStatisticsAsync();
        Task<bool> CancelAsync(string id);
    }

    public class MissionRepository : IMissionRepository
    {
        private readonly AppDbContext _context;

        public MissionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<Mission>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.Missions
                .AsQueryable(); // Remove .Include(m => m.Site)

            if (!string.IsNullOrWhiteSpace(filters.Name))
            {
                query = query.Where(m => m.Name != null && m.Name.Contains(filters.Name));
            }

            if (filters.StartDateMin.HasValue)
            {
                query = query.Where(m => m.StartDate >= filters.StartDateMin.Value);
            }

            if (filters.StartDateMax.HasValue)
            {
                query = query.Where(m => m.StartDate <= filters.StartDateMax.Value);
            }

            if (!string.IsNullOrWhiteSpace(filters.Site))
            {
                query = query.Where(m => m.Site != null && m.Site.Contains(filters.Site));
            }

            if (!string.IsNullOrWhiteSpace(filters.Status))
            {
                query = query.Where(m => m.Status != null && m.Status.Contains(filters.Status));
            }

            var totalCount = await query.CountAsync();

            var results = await query
                .OrderByDescending(m => m.StartDate)
                .ThenBy(m => m.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        public async Task<IEnumerable<Mission>> GetAllAsync()
        {
            return await _context.Missions
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<Mission?> GetByIdAsync(string id)
        {
            return await _context.Missions
                .FirstOrDefaultAsync(m => m.MissionId == id);
        }

        public async Task AddAsync(Mission mission)
        {
            await _context.Missions.AddAsync(mission);
        }

        public Task UpdateAsync(Mission mission)
        {
            _context.Missions.Update(mission);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Mission mission)
        {
            _context.Missions.Remove(mission);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<bool> CancelAsync(string id)
        {
            var mission = await _context.Missions
                .FirstOrDefaultAsync(m => m.MissionId == id);
            if (mission == null) return false;

            mission.Status = "Annulé";
            _context.Missions.Update(mission);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<MissionStats> GetStatisticsAsync()
        {
            var total = await _context.Missions.CountAsync();
            var enCours = await _context.Missions
                .CountAsync(m => m.Status == "En Cours");
            var planifiee = await _context.Missions
                .CountAsync(m => m.Status == "Planifié"); // Ajout du statut Planifiée
            var terminee = await _context.Missions
                .CountAsync(m => m.Status == "Terminée");
            var annulee = await _context.Missions
                .CountAsync(m => m.Status == "Annulé");

            return new MissionStats()
            {
                Total = total,
                EnCours = enCours,
                Planifiee = planifiee, // Correspondance ajoutée
                Terminee = terminee,
                Annulee = annulee
            };
        }
    }
}