using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.users;
using Microsoft.Extensions.Logging;
using MyApp.Api.Services.logs; // Added for ILogger

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
        Task RemoveRolesAsync(UserRoleDtoFormBulk dto);
    }

    public class UserRoleService : IUserRoleService
    {
        private readonly IUserRoleRepository _repository;
        private readonly ILogger<UserRoleService> _logger;
        private readonly ILogService _logService;

        public UserRoleService(IUserRoleRepository repository, ILogger<UserRoleService> logger, ILogService logService)
        {
            _repository = repository;
            _logger = logger;
            _logService = logService;
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

                await _logService.LogAsync("CREATION USER_ROLE", null, entity, dto.UserId, "UserId,RoleId");

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
                var oldEntity = await _repository.GetByKeysAsync(dto.UserId, dto.RoleId);
                if (oldEntity == null)
                {
                    _logger.LogWarning("Échec de la mise à jour, relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId} introuvable", dto.UserId, dto.RoleId);
                    return null;
                }

                var newEntity = new UserRole(dto);

                await _repository.UpdateAsync(newEntity);
                await _repository.SaveChangesAsync();

                await _logService.LogAsync("MODIFICATION USER_ROLE", oldEntity, newEntity, dto.UserId, "UserId,RoleId");

                _logger.LogInformation("Relation utilisateur-rôle mise à jour avec succès pour UserId {UserId} et RoleId {RoleId}", dto.UserId, dto.RoleId);
                return newEntity;
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

                await _logService.LogAsync("SUPPRESSION USER_ROLE", entity, null, userId, "UserId,RoleId");

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
                if (dto == null || !dto.UserIds.Any() || !dto.RoleIds.Any())
                {
                    throw new ArgumentException("La liste des IDs d'utilisateurs ou la liste des IDs de rôles ne peuvent pas être null ou vides");
                }

                foreach (var userId in dto.UserIds)
                {
                    if (string.IsNullOrWhiteSpace(userId))
                    {
                        throw new ArgumentException("Un ID d'utilisateur ne peut pas être null ou vide");
                    }
                }

                foreach (var roleId in dto.RoleIds)
                {
                    if (string.IsNullOrWhiteSpace(roleId))
                    {
                        throw new ArgumentException("Un ID de rôle ne peut pas être null ou vide");
                    }
                }

                var currentUserRoles = await _repository.GetAllAsync();
                var oldUserNames = new Dictionary<string, string>(); 
                var oldUTILISATEUR_ROLE = new Dictionary<string, List<string>>(); 
                
                foreach (var userId in dto.UserIds)
                {
                    var currentRolesForUser = currentUserRoles.Where(ur => ur.UserId == userId).ToList();
                    
                    // Seulement traiter si l'utilisateur a des rôles existants
                    if (currentRolesForUser.Any())
                    {
                        string userName = currentRolesForUser.First().User?.Name ?? "Unknown";
                        oldUserNames[userId] = userName;

                        var roleNames = currentRolesForUser
                            .Select(ur => ur.Role?.Name ?? "Unknown")
                            .ToList();
                        
                        oldUTILISATEUR_ROLE[userName] = roleNames;
                    }
                }

                var oldBulkData = new { UserNames = oldUserNames, UTILISATEUR_ROLE = oldUTILISATEUR_ROLE };

                await _repository.SynchronizeRolesAsync(dto.UserIds, dto.RoleIds);
                
                await _repository.SaveChangesAsync();

                var updatedUserRoles = await _repository.GetAllAsync();
                var newUserNames = new Dictionary<string, string>(); 
                var newUTILISATEUR_ROLE = new Dictionary<string, List<string>>(); 
                
                foreach (var userId in dto.UserIds)
                {
                    var updatedRolesForUser = updatedUserRoles.Where(ur => ur.UserId == userId).ToList();
                    
                    // Seulement traiter si l'utilisateur a des rôles après la mise à jour
                    if (updatedRolesForUser.Any())
                    {
                        string userName = updatedRolesForUser.First().User?.Name ?? "Unknown";
                        newUserNames[userId] = userName;

                        var roleNames = updatedRolesForUser
                            .Select(ur => ur.Role?.Name ?? "Unknown")
                            .ToList();
                        
                        newUTILISATEUR_ROLE[userName] = roleNames;
                    }
                }

                var newBulkData = new { UserNames = newUserNames, UTILISATEUR_ROLE = newUTILISATEUR_ROLE };
                
                await _logService.LogAsync("MODIFIER","UTILISATEUR_ROLE", oldBulkData, newBulkData, dto.UserIdLog, "UTILISATEUR_ROLE");

            }
            catch (Exception ex)
            {
                var userIdsLog = dto?.UserIds != null ? string.Join(", ", dto.UserIds) : "inconnus";
                _logger.LogError(ex, "Erreur lors de la mise à jour des relations utilisateur-rôle pour les UserIds {UserIds}", userIdsLog);
                throw;
            }
        }

        public async Task RemoveRolesAsync(UserRoleDtoFormBulk dto)
        {
            try
            {
                if (dto == null || !dto.UserIds.Any() || !dto.RoleIds.Any())
                {
                    throw new ArgumentException("La liste des IDs d'utilisateurs ou la liste des IDs de rôles ne peuvent pas être null ou vides");
                }

                foreach (var userId in dto.UserIds)
                {
                    if (string.IsNullOrWhiteSpace(userId))
                    {
                        throw new ArgumentException("Un ID d'utilisateur ne peut pas être null ou vide");
                    }
                }

                foreach (var roleId in dto.RoleIds)
                {
                    if (string.IsNullOrWhiteSpace(roleId))
                    {
                        throw new ArgumentException("Un ID de rôle ne peut pas être null ou vide");
                    }
                }

                // Capturer l'état AVANT la suppression
                var currentUserRoles = await _repository.GetAllAsync();
                var oldUserNames = new Dictionary<string, string>(); 
                var oldUTILISATEUR_ROLE = new Dictionary<string, List<string>>(); 
                
                foreach (var userId in dto.UserIds)
                {
                    var currentRolesForUser = currentUserRoles.Where(ur => ur.UserId == userId).ToList();
                    
                    // Seulement traiter si l'utilisateur a des rôles existants
                    if (currentRolesForUser.Any())
                    {
                        string userName = currentRolesForUser.First().User?.Name ?? "Unknown";
                        oldUserNames[userId] = userName;

                        var roleNames = currentRolesForUser
                            .Select(ur => ur.Role?.Name ?? "Unknown")
                            .ToList();
                        
                        oldUTILISATEUR_ROLE[userName] = roleNames;
                    }
                }

                var oldBulkData = new { UserNames = oldUserNames, UTILISATEUR_ROLE = oldUTILISATEUR_ROLE };

                // Effectuer la suppression
                foreach (var userId in dto.UserIds)
                {
                    foreach (var roleId in dto.RoleIds)
                    {
                        await _repository.DeleteAsync(userId, roleId);
                    }
                }

                await _repository.SaveChangesAsync();

                // Capturer l'état APRÈS la suppression
                var updatedUserRoles = await _repository.GetAllAsync();
                var newUserNames = new Dictionary<string, string>(); 
                var newUTILISATEUR_ROLE = new Dictionary<string, List<string>>(); 
                
                foreach (var userId in dto.UserIds)
                {
                    var updatedRolesForUser = updatedUserRoles.Where(ur => ur.UserId == userId).ToList();
                    
                    // Seulement traiter si l'utilisateur a encore des rôles après la suppression
                    if (updatedRolesForUser.Any())
                    {
                        string userName = updatedRolesForUser.First().User?.Name ?? "Unknown";
                        newUserNames[userId] = userName;

                        var roleNames = updatedRolesForUser
                            .Select(ur => ur.Role?.Name ?? "Unknown")
                            .ToList();
                        
                        newUTILISATEUR_ROLE[userName] = roleNames;
                    }
                }

                var newBulkData = new { UserNames = newUserNames, UTILISATEUR_ROLE = newUTILISATEUR_ROLE };
                
                await _logService.LogAsync("SUPPRIMER", "UTILISATEUR_ROLE", oldBulkData, newBulkData, dto.UserIdLog, "UTILISATEUR_ROLE");

            }
            catch (Exception ex)
            {
                var userIdsLog = dto?.UserIds != null ? string.Join(", ", dto.UserIds) : "inconnus";
                var roleIdsLog = dto?.RoleIds != null ? string.Join(", ", dto.RoleIds) : "inconnus";
                _logger.LogError(ex, "Erreur lors de la suppression des relations utilisateur-rôle pour les UserIds {UserIds} et RoleIds {RoleIds}", userIdsLog, roleIdsLog);
                throw;
            }
        }
    }
}