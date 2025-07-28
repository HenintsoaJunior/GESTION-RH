using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.list.mission;
using MyApp.Api.Models.search.mission;

namespace MyApp.Api.Repositories.mission
{
    // Interface du repository pour la gestion des missions
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

    // Implémentation du repository des missions
    public class MissionRepository : IMissionRepository
    {
        private readonly AppDbContext _context;

        // Constructeur avec injection du contexte de base de données
        public MissionRepository(AppDbContext context)
        {
            _context = context;
        }

        // Recherche paginée de missions avec filtres
        public async Task<(IEnumerable<Mission>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.Missions
                .Include(m => m.Lieu)
                .AsQueryable();

            // Filtre par nom de mission
            if (!string.IsNullOrWhiteSpace(filters.Name))
            {
                query = query.Where(m => m.Name.Contains(filters.Name));
            }

            // Filtre par date de début minimale
            if (filters.StartDateMin.HasValue)
            {
                query = query.Where(m => m.StartDate >= filters.StartDateMin.Value);
            }

            // Filtre par date de début maximale
            if (filters.StartDateMax.HasValue)
            {
                query = query.Where(m => m.StartDate <= filters.StartDateMax.Value);
            }

            // Filtre par LieuId
            if (!string.IsNullOrWhiteSpace(filters.LieuId))
            {
                query = query.Where(m => m.LieuId.Contains(filters.LieuId));
            }

            // Filtre par statut
            if (!string.IsNullOrWhiteSpace(filters.Status))
            {
                query = query.Where(m => m.Status.Contains(filters.Status));
            }

            var totalCount = await query.CountAsync(); // Nombre total de résultats

            // Récupération des résultats paginés
            var results = await query
                .OrderByDescending(m => m.StartDate)
                .ThenBy(m => m.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        // Récupère toutes les missions triées par date de création décroissante
        public async Task<IEnumerable<Mission>> GetAllAsync()
        {
            return await _context.Missions
                .Include(m => m.Lieu)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        // Récupère une mission par son identifiant
        public async Task<Mission?> GetByIdAsync(string id)
        {
            return await _context.Missions
                .Include(m => m.Lieu)
                .FirstOrDefaultAsync(m => m.MissionId == id);
        }

        // Ajoute une nouvelle mission à la base
        public async Task AddAsync(Mission mission)
        {
            await _context.Missions.AddAsync(mission);
        }

        // Met à jour une mission existante
        public Task UpdateAsync(Mission mission)
        {
            _context.Missions.Update(mission);
            return Task.CompletedTask;
        }

        // Supprime une mission existante
        public Task DeleteAsync(Mission mission)
        {
            _context.Missions.Remove(mission);
            return Task.CompletedTask;
        }

        // Sauvegarde les changements dans la base de données
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        // Annule une mission (change son statut à "Annulé")
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

        // Récupère des statistiques sur les missions (total, par statut)
        public async Task<MissionStats> GetStatisticsAsync()
        {
            var total = await _context.Missions.CountAsync();
            var enCours = await _context.Missions
                .CountAsync(m => m.Status == "En Cours");
            var planifiee = await _context.Missions
                .CountAsync(m => m.Status == "Planifié");
            var terminee = await _context.Missions
                .CountAsync(m => m.Status == "Terminé");
            var annulee = await _context.Missions
                .CountAsync(m => m.Status == "Annulé");

            return new MissionStats()
            {
                Total = total,
                EnCours = enCours,
                Planifiee = planifiee,
                Terminee = terminee,
                Annulee = annulee
            };
        }
    }
}