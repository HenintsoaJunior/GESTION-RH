using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.search.mission;

namespace MyApp.Api.Repositories.mission
{
    // Interface du repository pour la gestion des assignations de mission
    public interface IMissionAssignationRepository
    {
        // Récupère les identifiants des employés assignés à une mission spécifique
        Task<IEnumerable<string>> GetAssignedEmployeeIdsAsync(string missionId);
        // Récupère toutes les assignations
        Task<IEnumerable<MissionAssignation>> GetAllAsync();

        // Récupère une assignation par identifiants (avec transport)
        Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId, string? transportId);

        // Récupère une assignation par identifiants (sans transport)
        Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId);

        // Recherche paginée avec filtres
        Task<(IEnumerable<MissionAssignation>, int)> SearchAsync(MissionAssignationSearchFiltersDTO filters, int page, int pageSize);

        // Ajoute une nouvelle assignation
        Task AddAsync(MissionAssignation missionAssignation);

        // Met à jour une assignation existante
        Task UpdateAsync(MissionAssignation missionAssignation);

        // Supprime une assignation
        Task DeleteAsync(MissionAssignation missionAssignation);

        // Sauvegarde les changements dans la base
        Task SaveChangesAsync();
    }

    public class MissionAssignationRepository : IMissionAssignationRepository
    {
        private readonly AppDbContext _context;

        public MissionAssignationRepository(AppDbContext context)
        {
            _context = context;
        }


        public async Task<IEnumerable<string>> GetAssignedEmployeeIdsAsync(string missionId)
        {
            return await _context.MissionAssignations
                .Where(ma => ma.MissionId == missionId)
                .Select(ma => ma.EmployeeId)
                .Distinct()
                .ToListAsync();
        }
        // Récupère toutes les assignations avec les relations associées
        public async Task<IEnumerable<MissionAssignation>> GetAllAsync()
        {
            return await _context.MissionAssignations
                .Include(ma => ma.Employee)
                .Include(ma => ma.Mission)
                .Include(ma => ma.Transport)
                .OrderBy(ma => ma.DepartureDate)
                .ToListAsync();
        }

        // Récupère une assignation par employé, mission et transport
        public async Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId, string? transportId)
        {
            return await _context.MissionAssignations
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Direction)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Department)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Service)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Site)
                .Include(ma => ma.Mission)
                .Include(ma => ma.Transport)
                .FirstOrDefaultAsync(ma => 
                    ma.EmployeeId == employeeId && 
                    ma.MissionId == missionId && 
                    ma.TransportId == transportId);
        }
        
        // Récupère une assignation par employé et mission
        public async Task<MissionAssignation?> GetByIdAsync(string employeeId, string missionId)
        {
            return await _context.MissionAssignations
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Direction)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Department)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Service)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Site)
                .Include(ma => ma.Mission)
                .Include(ma => ma.Transport)
                .FirstOrDefaultAsync(ma => 
                    ma.EmployeeId == employeeId && 
                    ma.MissionId == missionId);
        }

        // Recherche paginée avec filtres dynamiques
        public async Task<(IEnumerable<MissionAssignation>, int)> SearchAsync(MissionAssignationSearchFiltersDTO filters, int page, int pageSize)
        {
            // Création de la requête de base avec les relations
            var query = _context.MissionAssignations
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Direction)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Department)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Service)
                .Include(ma => ma.Employee)
                .ThenInclude(e => e.Site)
                .Include(ma => ma.Mission)
                .Include(ma => ma.Transport)
                .AsQueryable();

            // Filtre par identifiant employé
            if (!string.IsNullOrWhiteSpace(filters.EmployeeId))
            {
                query = query.Where(ma => ma.EmployeeId.Contains(filters.EmployeeId));
            }

            // Filtre par identifiant mission
            if (!string.IsNullOrWhiteSpace(filters.MissionId))
            {
                query = query.Where(ma => ma.MissionId.Contains(filters.MissionId));
            }

            // Filtre par identifiant transport
            if (!string.IsNullOrWhiteSpace(filters.TransportId))
            {
                query = query.Where(ma => ma.TransportId != null && ma.TransportId.Contains(filters.TransportId));
            }

            // Filtre par date de départ minimale
            if (filters.DepartureDateMin.HasValue)
            {
                query = query.Where(ma => ma.DepartureDate >= filters.DepartureDateMin.Value);
            }

            // Filtre par date de départ maximale
            if (filters.DepartureDateMax.HasValue)
            {
                query = query.Where(ma => ma.DepartureDate <= filters.DepartureDateMax.Value);
            }

            // Filtre par statut de la mission
            if (!string.IsNullOrWhiteSpace(filters.Status))
            {
                query = query.Where(ma => ma.Mission != null && ma.Mission.Status.Contains(filters.Status));
            }

            // Compte total des résultats filtrés
            var totalCount = await query.CountAsync();

            // Récupère les résultats paginés, triés par date de départ décroissante
            var results = await query
                .OrderByDescending(ma => ma.DepartureDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Retourne la liste paginée et le nombre total
            return (results, totalCount);
        }

        // Ajoute une nouvelle assignation
        public async Task AddAsync(MissionAssignation missionAssignation)
        {
            await _context.MissionAssignations.AddAsync(missionAssignation);
        }

        // Met à jour une assignation existante
        public Task UpdateAsync(MissionAssignation missionAssignation)
        {
            _context.MissionAssignations.Update(missionAssignation);
            return Task.CompletedTask;
        }

        // Supprime une assignation
        public Task DeleteAsync(MissionAssignation missionAssignation)
        {
            _context.MissionAssignations.Remove(missionAssignation);
            return Task.CompletedTask;
        }

        // Sauvegarde les changements dans la base
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
