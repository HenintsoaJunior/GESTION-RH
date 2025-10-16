using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.users;
using MyApp.Api.Services.logs;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.users;

public interface IRoleService
{
    Task<IEnumerable<Role>> GetAllAsync();
    Task<IEnumerable<RoleWithGroupedHabilitationsDto>> GetAllInfoAsync();
    Task<Role?> GetByIdAsync(string id);
    Task AddAsync(RoleDTOForm dto);
    Task UpdateAsync(string id, RoleUpdateDto? dto, string? userId);
    Task DeleteAsync(string id, string userId);
}

public class RoleService : IRoleService
{
    private readonly IRoleRepository _repository;
    private readonly IRoleHabilitationRepository _roleHabilitationRepository;
    private readonly ILogService _logService;
    private readonly ISequenceGenerator _sequenceGenerator;
    private readonly ILogger<RoleService> _logger;

    public RoleService(
        IRoleRepository repository,
        ILogService logService,
        ISequenceGenerator sequenceGenerator,
        ILogger<RoleService> logger,
        IRoleHabilitationRepository roleHabilitationRepository)
    {
        _repository = repository;
        _logService = logService;
        _sequenceGenerator = sequenceGenerator;
        _logger = logger;
        _roleHabilitationRepository = roleHabilitationRepository;
    }

    public async Task<IEnumerable<Role>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Récupération de tous les rôles");
            return await _repository.GetAllAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des rôles");
            throw;
        }
    }


    public async Task<IEnumerable<RoleWithGroupedHabilitationsDto>> GetAllInfoAsync()
    {
        try
        {
            return await _repository.GetAllInfoAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des rôles avec habilitations groupées");
            throw;
        }
    }
    public async Task<Role?> GetByIdAsync(string id)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                _logger.LogWarning("Tentative de récupération d'un rôle avec un ID null ou vide");
                return null;
            }

            _logger.LogInformation("Récupération du rôle avec l'ID: {RoleId}", id);
            return await _repository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération du rôle avec l'ID: {RoleId}", id);
            throw;
        }
    }

    public async Task AddAsync(RoleDTOForm dto)
    {
        try
        {
            var role = new Role(dto);
            if (role == null)
            {
                throw new ArgumentNullException(nameof(role), "Le rôle ne peut pas être null");
            }

            if (string.IsNullOrWhiteSpace(role.RoleId))
            {
                role.RoleId = _sequenceGenerator.GenerateSequence("seq_role_id", "ROLE", 6, "-");
                _logger.LogInformation("ID généré pour le rôle: {RoleId}", role.RoleId);
            }

            await _repository.AddAsync(role);
            await _repository.SaveChangesAsync();

            // Synchroniser les habilitations
            if (dto.HabilitationIds.Count != 0)
            {
                await _roleHabilitationRepository.SynchronizeHabilitationsAsync(role.RoleId, dto.HabilitationIds);
                _logger.LogInformation("Habilitations synchronisées pour le rôle: {RoleId}", role.RoleId);
            }

            _logger.LogInformation("Rôle ajouté avec succès avec l'ID: {RoleId}", role.RoleId);

            if (dto.UserId != null)
                await _logService.LogAsync("INSERTION", null, role, dto.UserId, "Name,Description,HabilitationIds");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de l'ajout du rôle");
            throw;
        }
    }

    public async Task UpdateAsync(string id, RoleUpdateDto? dto, string? userId)
    {
        try
        {
            if (dto == null)
            {
                _logger.LogWarning("Tentative de mise à jour avec un RoleUpdateDto null");
                throw new ArgumentNullException(nameof(dto), "Les données du rôle ne peuvent pas être nulles");
            }

            var existingRole = await _repository.GetByIdAsync(id);
            if (existingRole == null)
            {
                throw new InvalidOperationException($"Le rôle avec l'ID {id} n'existe pas");
            }

            var roleToUpdate = await _repository.GetByIdForUpdateAsync(id);
            if (roleToUpdate == null)
            {
                throw new InvalidOperationException($"Le rôle avec l'ID {id} n'existe pas");
            }

            roleToUpdate.Name = dto.Name;
            roleToUpdate.Description = dto.Description;

            await _repository.UpdateAsync(roleToUpdate);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Rôle mis à jour avec succès avec l'ID: {RoleId}", id);

            if (userId != null)
                await _logService.LogAsync("MODIFIER","ROLE", existingRole, roleToUpdate, userId, "Name,Description");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la mise à jour du rôle avec l'ID: {RoleId}", id);
            throw;
        }
    }
                                                
    public async Task DeleteAsync(string id, string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                throw new ArgumentException("L'ID du rôle ne peut pas être null ou vide", nameof(id));
            }
            var existingRole = await _repository.GetByIdAsync(id);
            if (existingRole == null)
            {
                throw new InvalidOperationException($"Le rôle avec l'ID {id} n'existe pas");
            }

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("Rôle supprimé avec succès pour l'ID: {RoleId}", id);

            await _logService.LogAsync("SUPPRIMER","ROLE", existingRole, null, userId,"Name,Description");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la suppression du rôle avec l'ID: {RoleId}", id);
            throw;
        }
    }
}