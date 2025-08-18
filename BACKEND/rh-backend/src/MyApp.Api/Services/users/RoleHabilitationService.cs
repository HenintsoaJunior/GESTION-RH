using MyApp.Api.Entities.users;
using MyApp.Api.Repositories.users;

namespace MyApp.Api.Services.users;

public interface IRoleHabilitationService
    {
        Task<IEnumerable<RoleHabilitation>> GetAllAsync();
        Task<RoleHabilitation?> GetByKeysAsync(string habilitationId, string roleId);
        Task AddAsync(RoleHabilitation roleHabilitation);
        Task UpdateAsync(RoleHabilitation roleHabilitation);
        Task DeleteAsync(string habilitationId, string roleId);
    }

    public class RoleHabilitationService : IRoleHabilitationService
    {
        private readonly IRoleHabilitationRepository _repository;
        private readonly ILogger<RoleHabilitationService> _logger;

        public RoleHabilitationService(
            IRoleHabilitationRepository repository,
            ILogger<RoleHabilitationService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<IEnumerable<RoleHabilitation>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les role_habilitations");
                return await _repository.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des role_habilitations");
                throw;
            }
        }

        public async Task<RoleHabilitation?> GetByKeysAsync(string habilitationId, string roleId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(habilitationId) || string.IsNullOrWhiteSpace(roleId))
                {
                    _logger.LogWarning("Tentative de récupération d'un role_habilitation avec des IDs null ou vides");
                    return null;
                }

                _logger.LogInformation("Récupération du role_habilitation avec HabilitationId: {HabilitationId} et RoleId: {RoleId}", habilitationId, roleId);
                return await _repository.GetByKeysAsync(habilitationId, roleId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du role_habilitation avec HabilitationId: {HabilitationId} et RoleId: {RoleId}", habilitationId, roleId);
                throw;
            }
        }

        public async Task AddAsync(RoleHabilitation roleHabilitation)
        {
            try
            {
                if (roleHabilitation == null)
                {
                    throw new ArgumentNullException(nameof(roleHabilitation), "Le role_habilitation ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(roleHabilitation.HabilitationId) || string.IsNullOrWhiteSpace(roleHabilitation.RoleId))
                {
                    throw new ArgumentException("Les IDs d'habilitation et de rôle ne peuvent pas être null ou vides");
                }

                await _repository.AddAsync(roleHabilitation);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Role_habilitation ajouté avec succès avec HabilitationId: {HabilitationId} et RoleId: {RoleId}", roleHabilitation.HabilitationId, roleHabilitation.RoleId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout du role_habilitation avec HabilitationId: {HabilitationId} et RoleId: {RoleId}", roleHabilitation?.HabilitationId, roleHabilitation?.RoleId);
                throw;
            }
        }

        public async Task UpdateAsync(RoleHabilitation roleHabilitation)
        {
            try
            {
                if (roleHabilitation == null)
                {
                    throw new ArgumentNullException(nameof(roleHabilitation), "Le role_habilitation ne peut pas être null");
                }

                if (string.IsNullOrWhiteSpace(roleHabilitation.HabilitationId) || string.IsNullOrWhiteSpace(roleHabilitation.RoleId))
                {
                    throw new ArgumentException("Les IDs d'habilitation et de rôle ne peuvent pas être null ou vides", nameof(roleHabilitation));
                }

                await _repository.UpdateAsync(roleHabilitation);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Role_habilitation mis à jour avec succès pour HabilitationId: {HabilitationId} et RoleId: {RoleId}", roleHabilitation.HabilitationId, roleHabilitation.RoleId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du role_habilitation avec HabilitationId: {HabilitationId} et RoleId: {RoleId}", roleHabilitation?.HabilitationId, roleHabilitation?.RoleId);
                throw;
            }
        }

        public async Task DeleteAsync(string habilitationId, string roleId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(habilitationId) || string.IsNullOrWhiteSpace(roleId))
                {
                    throw new ArgumentException("Les IDs d'habilitation et de rôle ne peuvent pas être null ou vides");
                }

                await _repository.DeleteAsync(habilitationId, roleId);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Role_habilitation supprimé avec succès pour HabilitationId: {HabilitationId} et RoleId: {RoleId}", habilitationId, roleId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du role_habilitation avec HabilitationId: {HabilitationId} et RoleId: {RoleId}", habilitationId, roleId);
                throw;
            }
        }
    }