using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.lieu;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    // Interface du service lieu, définit les opérations disponibles
    public interface ILieuService
    {
        Task<Lieu?> VerifyLieuExistsAsync(string nom, string? pays);
        Task<(IEnumerable<Lieu>, int)> SearchAsync(LieuSearchFiltersDTO filters, int page, int pageSize); // Recherche paginée avec filtres
        Task<IEnumerable<Lieu>> GetAllAsync(); // Récupère tous les lieux
        Task<Lieu?> GetByIdAsync(string id); // Récupère un lieu par son ID
        Task<string> CreateAsync(LieuDTOForm lieuDTO); // Crée un nouveau lieu
        Task<bool> UpdateAsync(Lieu lieu); // Met à jour un lieu existant
        Task<bool> DeleteAsync(string id); // Supprime un lieu par son ID
    }

    // Implémentation du service lieu
    public class LieuService : ILieuService
    {
        private readonly ILieuRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<Lieu> _logger;

        // Constructeur avec injection des dépendances
        public LieuService(ILieuRepository repository, ISequenceGenerator sequenceGenerator, ILogger<Lieu> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        public async Task<Lieu?> VerifyLieuExistsAsync(string nom, string? pays)
        {
            
            var filters = new LieuSearchFiltersDTO
            {
                Nom = nom,
                Pays = pays
            };
            var (result, total) = await _repository.SearchAsync(filters, 1, 1);
            var lieu = result.FirstOrDefault();
            return lieu;
        }

        // Recherche paginée de lieux avec filtres
        public async Task<(IEnumerable<Lieu>, int)> SearchAsync(LieuSearchFiltersDTO filters, int page, int pageSize)
        {
            return await _repository.SearchAsync(filters, page, pageSize);
        }

        // Récupère tous les lieux
        public async Task<IEnumerable<Lieu>> GetAllAsync()
        {
            return await _repository.GetAllAsync();
        }

        // Récupère un lieu par son identifiant
        public async Task<Lieu?> GetByIdAsync(string id)
        {
            return await _repository.GetByIdAsync(id);
        }

        // Crée un nouveau lieu à partir d'un formulaire
        public async Task<string> CreateAsync(LieuDTOForm lieuDTO)
        {
            try
            {
                // Génère un nouvel ID
                var lieuId = _sequenceGenerator.GenerateSequence("seq_lieu_id", "LIEU", 6, "-");

                var lieu = new Lieu(lieuDTO) { LieuId = lieuId };
                await _repository.AddAsync(lieu);
                await _repository.SaveChangesAsync();
                _logger.LogInformation("Lieu créé avec l'ID: {LieuId}", lieuId);
                return lieuId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du lieu");
                throw;
            }
        }

        // Met à jour un lieu existant
        public async Task<bool> UpdateAsync(Lieu lieu)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(lieu.LieuId);
                if (entity == null) return false;

                // Mise à jour des champs principaux
                entity.Nom = lieu.Nom;
                entity.Adresse = lieu.Adresse;
                entity.Ville = lieu.Ville;
                entity.CodePostal = lieu.CodePostal;
                entity.Pays = lieu.Pays;
                entity.UpdatedAt = DateTime.UtcNow;

                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du lieu {LieuId}", lieu.LieuId);
                throw;
            }
        }

        // Supprime un lieu par son identifiant
        public async Task<bool> DeleteAsync(string id)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return false;

                await _repository.DeleteAsync(entity);
                await _repository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du lieu {LieuId}", id);
                throw;
            }
        }
    }
}