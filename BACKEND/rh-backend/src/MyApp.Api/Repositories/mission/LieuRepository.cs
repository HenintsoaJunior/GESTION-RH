using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.lieu;

namespace MyApp.Api.Repositories.mission
{
    // Interface du repository pour la gestion des lieux
    public interface ILieuRepository
    {
        Task<(IEnumerable<Lieu>, int)> SearchAsync(LieuSearchFiltersDTO filters, int page, int pageSize); // Recherche paginée avec filtres
        Task<IEnumerable<Lieu>> GetAllAsync(); // Récupère tous les lieux
        Task<Lieu?> GetByIdAsync(string id); // Récupère un lieu par son ID
        Task AddAsync(Lieu lieu); // Ajoute un nouveau lieu
        Task UpdateAsync(Lieu lieu); // Met à jour un lieu existant
        Task DeleteAsync(Lieu lieu); // Supprime un lieu existant
        Task SaveChangesAsync(); // Sauvegarde les changements dans la base
    }

    // Implémentation du repository des lieux
    public class LieuRepository : ILieuRepository
    {
        private readonly AppDbContext _context;

        // Constructeur avec injection du contexte de base de données
        public LieuRepository(AppDbContext context)
        {
            _context = context;
        }

        // Recherche paginée de lieux avec filtres (nom, ville, pays)
        public async Task<(IEnumerable<Lieu>, int)> SearchAsync(LieuSearchFiltersDTO filters, int page, int pageSize)
        {
            var query = _context.Lieux.AsQueryable();

            // Filtre par nom
            if (!string.IsNullOrWhiteSpace(filters.Nom))
            {
                query = query.Where(l => l.Nom.Contains(filters.Nom));
            }

            // Filtre par ville
            if (!string.IsNullOrWhiteSpace(filters.Ville))
            {
                query = query.Where(l => l.Ville != null && l.Ville.Contains(filters.Ville));
            }

            // Filtre par pays
            if (!string.IsNullOrWhiteSpace(filters.Pays))
            {
                query = query.Where(l => l.Pays != null && l.Pays.Contains(filters.Pays));
            }

            var totalCount = await query.CountAsync(); // Nombre total de résultats

            // Récupération des résultats paginés
            var results = await query
                .OrderBy(l => l.Nom)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (results, totalCount);
        }

        // Récupère tous les lieux triés par nom
        public async Task<IEnumerable<Lieu>> GetAllAsync()
        {
            return await _context.Lieux
                .OrderBy(l => l.Nom)
                .ToListAsync();
        }

        // Récupère un lieu par son identifiant, incluant ses missions associées
        public async Task<Lieu?> GetByIdAsync(string id)
        {
            return await _context.Lieux
                .FirstOrDefaultAsync(l => l.LieuId == id);
        }

        // Ajoute un nouveau lieu à la base
        public async Task AddAsync(Lieu lieu)
        {
            await _context.Lieux.AddAsync(lieu);
        }

        // Met à jour un lieu existant
        public Task UpdateAsync(Lieu lieu)
        {
            _context.Lieux.Update(lieu);
            return Task.CompletedTask;
        }

        // Supprime un lieu existant
        public Task DeleteAsync(Lieu lieu)
        {
            _context.Lieux.Remove(lieu);
            return Task.CompletedTask;
        }

        // Sauvegarde les changements dans la base de données
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}