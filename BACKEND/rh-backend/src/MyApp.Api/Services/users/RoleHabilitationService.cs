using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.users;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;
namespace MyApp.Api.Services.users;

public interface IRoleHabilitationService
{
    Task<IEnumerable<RoleHabilitation>> GetAllAsync();
    Task<RoleHabilitation?> GetByKeysAsync(string habilitationId, string roleId);
    Task AddAsync(RoleHabilitationDTOForm dto);
    Task UpdateAsync(RoleHabilitation roleHabilitation);
    Task DeleteAsync(string habilitationId, string roleId);

    Task<IEnumerable<Habilitation>> GetHabilitationsByUserIdAsync(string userId);
    Task<IEnumerable<string>> GetHabilitationIdsByRoleIdsAsync(RoleIdsRequest roleIdsRequest);

    Task<Role> CreateRoleWithHabilitationsAsync(CreateRoleWithHabilitationsDto dto);
}
 
public class RoleHabilitationService : IRoleHabilitationService
{
    private readonly IRoleHabilitationRepository _repository;
    private readonly IRoleRepository _roleRepository;
    private readonly ISequenceGenerator _sequenceGenerator;
    private readonly ILogger<RoleHabilitationService> _logger;
    private readonly ILogService _logService;

    public RoleHabilitationService(
        IRoleHabilitationRepository repository,
        IRoleRepository roleRepository,
        ISequenceGenerator sequenceGenerator,
        ILogService logService,
        ILogger<RoleHabilitationService> logger)
    {
        _repository = repository;
        _roleRepository = roleRepository;
        _sequenceGenerator = sequenceGenerator;
        _logService = logService;
        _logger = logger;
    }

    public async Task<Role> CreateRoleWithHabilitationsAsync(CreateRoleWithHabilitationsDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                throw new ArgumentException("Le nom du rôle ne peut pas être null ou vide", nameof(dto.Name));
            }

            if (string.IsNullOrWhiteSpace(dto.Description))
            {
                throw new ArgumentException("La description du rôle ne peut pas être null ou vide", nameof(dto.Description));
            }

            var validHabilitationIds = dto.HabilitationIds?.Where(id => !string.IsNullOrWhiteSpace(id)).ToList() ?? new List<string>();

            _logger.LogInformation("Création d'un nouveau rôle avec le nom: {Name} et description: {Description}", dto.Name, dto.Description);

            var roleId = _sequenceGenerator.GenerateSequence("seq_role_id", "ROLE", 6, "-");

            var role = new Role
            {
                RoleId = roleId,
                Name = dto.Name,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null
            };

            await _roleRepository.AddAsync(role);
            await _roleRepository.SaveChangesAsync();

            if (validHabilitationIds.Any())
            {
                await _repository.SynchronizeHabilitationsAsync(role.RoleId, validHabilitationIds);
                await _repository.SaveChangesAsync();
            }
            else
            {
                _logger.LogInformation("Aucune habilitation à synchroniser pour le rôle: {RoleId}", role.RoleId);
            }

            var updatedRoleHabs = await _repository.GetAllAsync();
            var oldRoleNames = new Dictionary<string, string>(); 
            var oldROLE_HABILITATION = new Dictionary<string, List<string>>(); 
            
            var newRoleNames = new Dictionary<string, string>(); 
            var newROLE_HABILITATION = new Dictionary<string, List<string>>(); 
            
            string roleName = role.Name;
            newRoleNames[role.RoleId] = roleName;

            var habsForRole = updatedRoleHabs.Where(rh => rh.RoleId == role.RoleId).ToList();
            var habNames = habsForRole
                .Select(rh => rh.Habilitation?.Label ?? "Unknown")
                .ToList();
            
            newROLE_HABILITATION[roleName] = habNames;

            var oldBulkData = new { RoleNames = oldRoleNames, ROLE_HABILITATION = oldROLE_HABILITATION };

            var newBulkData = new { RoleNames = newRoleNames, ROLE_HABILITATION = newROLE_HABILITATION };
            
            await _logService.LogAsync("CREER","ROLE_HABILITATION", oldBulkData, newBulkData, dto.UserIdLog, "ROLE_HABILITATION");

            return role;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la création du rôle avec le nom: {Name}", dto.Name);
            throw;
        }
    }

    public async Task<IEnumerable<string>> GetHabilitationIdsByRoleIdsAsync(RoleIdsRequest roleIdsRequest)
    {
        try
        {
            if (roleIdsRequest.RoleIds == null || !roleIdsRequest.RoleIds.Any())
            {
                _logger.LogWarning("Tentative de récupération des IDs d'habilitations avec une liste de rôles null ou vide");
                throw new ArgumentException("La liste des IDs de rôles ne peut pas être null ou vide", nameof(roleIdsRequest.RoleIds));
            }

            var validRoleIds = roleIdsRequest.RoleIds.Where(id => !string.IsNullOrWhiteSpace(id)).ToList();
            if (!validRoleIds.Any())
            {
                _logger.LogWarning("Aucune ID de rôle valide fournie pour la récupération des habilitations");
                return Enumerable.Empty<string>();
            }

            _logger.LogInformation("Récupération des IDs d'habilitations pour les rôles: {RoleIds}", string.Join(", ", validRoleIds));
            var habilitationIds = await _repository.GetHabilitationIdsByRoleIdsAsync(validRoleIds);

            if (!habilitationIds.Any())
            {
                _logger.LogInformation("Aucune habilitation trouvée pour les rôles fournis");
            }

            return habilitationIds;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des IDs d'habilitations pour les rôles: {RoleIds}", string.Join(", ", roleIdsRequest.RoleIds));
            throw;
        }
    }

    public async Task<IEnumerable<Habilitation>> GetHabilitationsByUserIdAsync(string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("Tentative de récupération des habilitations avec un ID utilisateur null ou vide");
                throw new ArgumentException("L'ID de l'utilisateur ne peut pas être null ou vide", nameof(userId));
            }

            _logger.LogInformation("Récupération des habilitations pour l'utilisateur avec ID: {UserId}", userId);
            var habilitations = await _repository.GetHabilitationsByUserIdAsync(userId);

            var async = habilitations.ToList();
            if (!async.Any())
            {
                _logger.LogInformation("Aucune habilitation trouvée pour l'utilisateur avec ID: {UserId}", userId);
            }

            return async;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des habilitations pour l'utilisateur avec ID: {UserId}", userId);
            throw;
        }
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

    public async Task AddAsync(RoleHabilitationDTOForm dto)
    {
        try
        {
            if (dto == null || !dto.HabilitationIds.Any() || !dto.RoleIds.Any())
            {
                throw new ArgumentException("Les listes d'IDs d'habilitation et de rôle ne peuvent pas être null ou vides");
            }

            foreach (var roleId in dto.RoleIds)
            {
                if (string.IsNullOrWhiteSpace(roleId))
                {
                    throw new ArgumentException("L'ID du rôle ne peut pas être null ou vide");
                }
            }

            foreach (var habId in dto.HabilitationIds)
            {
                if (string.IsNullOrWhiteSpace(habId))
                {
                    throw new ArgumentException("L'ID d'habilitation ne peut pas être null ou vide");
                }
            }

            var currentRoleHabs = await _repository.GetAllAsync();
            var oldRoleNames = new Dictionary<string, string>(); 
            var oldROLE_HABILITATION = new Dictionary<string, List<string>>(); 
            
            foreach (var roleId in dto.RoleIds)
            {
                var currentHabsForRole = currentRoleHabs.Where(rh => rh.RoleId == roleId).ToList();
                
                // Seulement traiter si le rôle a des habilitations existantes
                if (currentHabsForRole.Any())
                {
                    string roleName = currentHabsForRole.First().Role?.Name ?? "Unknown";
                    oldRoleNames[roleId] = roleName;

                    var habNames = currentHabsForRole
                        .Select(rh => rh.Habilitation?.Label ?? "Unknown")
                        .ToList();
                    
                    oldROLE_HABILITATION[roleName] = habNames;
                }
            }

            var oldBulkData = new { RoleNames = oldRoleNames, ROLE_HABILITATION = oldROLE_HABILITATION };

            foreach (var roleId in dto.RoleIds)
            {
                // Synchronize habilitations for the role
                await _repository.SynchronizeHabilitationsAsync(roleId, dto.HabilitationIds);
            }

            await _repository.SaveChangesAsync();

            var updatedRoleHabs = await _repository.GetAllAsync();
            var newRoleNames = new Dictionary<string, string>(); 
            var newROLE_HABILITATION = new Dictionary<string, List<string>>(); 
            
            foreach (var roleId in dto.RoleIds)
            {
                var updatedHabsForRole = updatedRoleHabs.Where(rh => rh.RoleId == roleId).ToList();
                
                // Seulement traiter si le rôle a des habilitations après la mise à jour
                if (updatedHabsForRole.Any())
                {
                    string roleName = updatedHabsForRole.First().Role?.Name ?? "Unknown";
                    newRoleNames[roleId] = roleName;

                    var habNames = updatedHabsForRole
                        .Select(rh => rh.Habilitation?.Label ?? "Unknown")
                        .ToList();
                    
                    newROLE_HABILITATION[roleName] = habNames;
                }
            }

            var newBulkData = new { RoleNames = newRoleNames, ROLE_HABILITATION = newROLE_HABILITATION };
            
            await _logService.LogAsync("MODIFIER","ROLE_HABILITATION", oldBulkData, newBulkData, dto.UserIdLog, "ROLE_HABILITATION");

            _logger.LogInformation("Relations rôle-habilitation mises à jour avec succès");
        }
        catch (Exception ex)
        {
            var roleIdsLog = dto?.RoleIds != null ? string.Join(", ", dto.RoleIds) : "inconnus";
            _logger.LogError(ex, "Erreur lors de la mise à jour des relations rôle-habilitation pour les RoleIds {RoleIds}", roleIdsLog);
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