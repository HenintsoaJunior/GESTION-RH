using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.users;
using Microsoft.Extensions.Logging; // Added for ILogger

namespace MyApp.Api.Services.users
{
    public interface IUserRoleService
    {
        Task<IEnumerable<UserRole>> GetAllAsync();
        Task<UserRole?> GetByKeysAsync(string userId, string roleId);
        Task<UserRole> CreateAsync(UserRoleDTOForm dto);
        Task<UserRole?> UpdateAsync(UserRoleDTOForm dto);
        Task<bool> DeleteAsync(string userId, string roleId);
        Task AddAsync(UserRoleDtoFormBulk dto);
        Task<string[]?> GetRoleNamesByUserIdAsync(string userId);
    }

    public class UserRoleService : IUserRoleService
    {
        private readonly IUserRoleRepository _repository;
        private readonly ILogger<UserRoleService> _logger; // Added ILogger dependency

        public UserRoleService(IUserRoleRepository repository, ILogger<UserRoleService> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task<string[]?> GetRoleNamesByUserIdAsync(string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("L'ID de l'utilisateur est null ou vide");
                    return null;
                }

                var userRoles = await _repository.GetAllAsync();
                var roleNames = userRoles
                    .Where(ur => ur.UserId == userId && ur.Role != null)
                    .Select(ur => ur.Role!.Name)
                    .Where(name => !string.IsNullOrWhiteSpace(name))
                    .Distinct()
                    .ToArray();

                if (!roleNames.Any())
                {
                    return null;
                }

                return roleNames;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des noms des rôles pour UserId {UserId}", userId);
                throw;
            }
        }
        public async Task<IEnumerable<UserRole>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les relations utilisateur-rôle");
                var userRoles = await _repository.GetAllAsync();
                return userRoles;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les relations utilisateur-rôle");
                throw;
            }
        }

        public async Task<UserRole?> GetByKeysAsync(string userId, string roleId)
        {
            try
            {
                _logger.LogInformation("Récupération de la relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId}", userId, roleId);
                var userRole = await _repository.GetByKeysAsync(userId, roleId);
                if (userRole == null)
                {
                    _logger.LogWarning("Relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId} non trouvée", userId, roleId);
                }
                return userRole;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId}", userId, roleId);
                throw;
            }
        }

        public async Task<UserRole> CreateAsync(UserRoleDTOForm dto)
        {
            try
            {
                _logger.LogInformation("Création d'une nouvelle relation utilisateur-rôle pour UserId {UserId} et RoleId {RoleId}", dto.UserId, dto.RoleId);
                var entity = new UserRole(dto);

                await _repository.AddAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Relation utilisateur-rôle créée avec succès pour UserId {UserId} et RoleId {RoleId}", dto.UserId, dto.RoleId);
                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la relation utilisateur-rôle pour UserId {UserId} et RoleId {RoleId}", dto.UserId, dto.RoleId);
                throw;
            }
        }

        public async Task<UserRole?> UpdateAsync(UserRoleDTOForm dto)
        {
            try
            {
                _logger.LogInformation("Mise à jour de la relation utilisateur-rôle pour UserId {UserId} et RoleId {RoleId}", dto.UserId, dto.RoleId);
                var entity = await _repository.GetByKeysAsync(dto.UserId, dto.RoleId);
                if (entity == null)
                {
                    _logger.LogWarning("Échec de la mise à jour, relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId} introuvable", dto.UserId, dto.RoleId);
                    return null;
                }

                entity = new UserRole(dto);

                await _repository.UpdateAsync(entity);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Relation utilisateur-rôle mise à jour avec succès pour UserId {UserId} et RoleId {RoleId}", dto.UserId, dto.RoleId);
                return entity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la relation utilisateur-rôle pour UserId {UserId} et RoleId {RoleId}", dto.UserId, dto.RoleId);
                throw;
            }
        }

        public async Task<bool> DeleteAsync(string userId, string roleId)
        {
            try
            {
                _logger.LogInformation("Suppression de la relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId}", userId, roleId);
                var entity = await _repository.GetByKeysAsync(userId, roleId);
                if (entity == null)
                {
                    _logger.LogWarning("Échec de suppression, relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId} introuvable", userId, roleId);
                    return false;
                }

                await _repository.DeleteAsync(userId, roleId);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Relation utilisateur-rôle supprimée avec succès pour UserId {UserId} et RoleId {RoleId}", userId, roleId);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId}", userId, roleId);
                throw;
            }
        }
        
        public async Task AddAsync(UserRoleDtoFormBulk dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.UserId) || !dto.RoleIds.Any())
                {
                    throw new ArgumentException("L'ID de l'utilisateur ou la liste des IDs de rôles ne peuvent pas être null ou vides");
                }

                // Validate role IDs
                foreach (var roleId in dto.RoleIds)
                {
                    if (string.IsNullOrWhiteSpace(roleId))
                    {
                        throw new ArgumentException("L'ID du rôle ne peut pas être null ou vide");
                    }
                }

                // Synchronize roles for the user
                await _repository.SynchronizeRolesAsync(dto.UserId, dto.RoleIds);

                await _repository.SaveChangesAsync();

                _logger.LogInformation("Relations utilisateur-rôle mises à jour avec succès pour UserId {UserId}", dto.UserId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour des relations utilisateur-rôle pour UserId {UserId}", dto.UserId);
                throw;
            }
        }
    }
}