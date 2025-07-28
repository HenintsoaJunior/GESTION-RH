using MyApp.Api.Entities.mission;
using MyApp.Api.Models.form.mission;
using MyApp.Api.Models.list.mission;
using MyApp.Api.Models.search.mission;
using MyApp.Api.Repositories.mission;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.mission
{
    // Interface du service mission, définit les opérations disponibles
    public interface IMissionService
    {
        Task<(IEnumerable<Mission>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize); // Recherche paginée avec filtres
        Task<IEnumerable<Mission>> GetAllAsync(); // Récupère toutes les missions
        Task<Mission?> GetByIdAsync(string id); // Récupère une mission par son ID
        Task<string> CreateAsync(MissionDTOForm mission); // Crée une nouvelle mission
        Task<bool> UpdateAsync(Mission mission); // Met à jour une mission existante
        Task<bool> DeleteAsync(string id); // Supprime une mission par son ID
        Task<MissionStats> GetStatisticsAsync(); // Statistiques sur les missions
        Task<bool> CancelAsync(string id); // Annule une mission
    }

    // Implémentation du service mission
    public class MissionService : IMissionService
    {
        private readonly IMissionRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<Mission> _logger;

        // Constructeur avec injection des dépendances
        public MissionService(IMissionRepository repository, ISequenceGenerator sequenceGenerator, ILogger<Mission> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
        }

        // Recherche paginée de missions avec filtres
        public async Task<(IEnumerable<Mission>, int)> SearchAsync(MissionSearchFiltersDTO filters, int page, int pageSize)
        {
            return await _repository.SearchAsync(filters, page, pageSize);
        }

        // Récupère toutes les missions
        public async Task<IEnumerable<Mission>> GetAllAsync()
        {
            try
            {
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les missions");
                throw;
            }
        }

        // Récupère une mission par son identifiant
        public async Task<Mission?> GetByIdAsync(string id)
        {
            try
            {
                return await _repository.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la mission {MissionId}", id);
                throw;
            }
        }

        // Crée une nouvelle mission à partir d'un formulaire
        public async Task<string> CreateAsync(MissionDTOForm missionDTO)
        {
            try
            {
                var missionId = _sequenceGenerator.GenerateSequence("seq_mission_id", "MIS", 6, "-");
                var mission = new Mission(missionDTO) { MissionId = missionId };

                await _repository.AddAsync(mission);
                await _repository.SaveChangesAsync();
                _logger.LogInformation("Mission créée avec l'ID: {MissionId}", missionId);
                return missionId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la mission");
                throw;
            }
        }

        // Met à jour une mission existante
        public async Task<bool> UpdateAsync(Mission mission)
        {
            try
            {
                var entity = await _repository.GetByIdAsync(mission.MissionId);
                if (entity == null) return false;

                // Mise à jour des champs principaux
                entity.Name = mission.Name;
                entity.Description = mission.Description;
                entity.StartDate = mission.StartDate;
                entity.LieuId = mission.LieuId;

                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la mission {MissionId}", mission.MissionId);
                throw;
            }
        }

        // Supprime une mission par son identifiant
        public async Task<bool> DeleteAsync(string id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            await _repository.DeleteAsync(entity);
            await _repository.SaveChangesAsync();
            return true;
        }

        // Annule une mission (change son statut à "Annulé")
        public async Task<bool> CancelAsync(string id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity == null) return false;

            entity.Status = "Annulé";
            await _repository.UpdateAsync(entity);
            await _repository.SaveChangesAsync();
            _logger.LogInformation("Mission {MissionId} annulée", id);
            return true;
        }

        // Récupère des statistiques sur les missions
        public async Task<MissionStats> GetStatisticsAsync()
        {
            return await _repository.GetStatisticsAsync();
        }
    }
}