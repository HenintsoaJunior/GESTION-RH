using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.users;

namespace MyApp.Api.Services.users;

public interface IUserHabilitationService
{
    Task<IEnumerable<UserHabilitation>> GetAllAsync();
    Task<UserHabilitation?> GetByKeysAsync(string habilitationId, string userId);
    Task AddAsync(UserHabilitationDTOForm dto);
    Task UpdateAsync(UserHabilitation userHabilitation);
    Task DeleteAsync(string habilitationId, string userId);

    Task<IEnumerable<Habilitation>> GetHabilitationsByUserIdAsync(string userId);
}
 
public class UserHabilitationService : IUserHabilitationService
{
    private readonly IUserHabilitationRepository _repository;
    private readonly IUserRoleRepository _userRoleRepository;
    private readonly ILogger<UserHabilitationService> _logger;

    public UserHabilitationService(
        IUserRoleRepository userRoleRepository,
        IUserHabilitationRepository repository,
        ILogger<UserHabilitationService> logger)
    {
        _userRoleRepository = userRoleRepository;
        _repository = repository;
        _logger = logger;
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

            var result = habilitations.ToList();
            if (!result.Any())
            {
                _logger.LogInformation("Aucune habilitation trouvée pour l'utilisateur avec ID: {UserId}", userId);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des habilitations pour l'utilisateur avec ID: {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<UserHabilitation>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Récupération de tous les user_habilitations");
            return await _repository.GetAllAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération des user_habilitations");
            throw;
        }
    }

    public async Task<UserHabilitation?> GetByKeysAsync(string habilitationId, string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(habilitationId) || string.IsNullOrWhiteSpace(userId))
            {
                _logger.LogWarning("Tentative de récupération d'un user_habilitation avec des IDs null ou vides");
                return null;
            }

            _logger.LogInformation("Récupération du user_habilitation avec HabilitationId: {HabilitationId} et UserId: {UserId}", habilitationId, userId);
            return await _repository.GetByKeysAsync(habilitationId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération du user_habilitation avec HabilitationId: {HabilitationId} et UserId: {UserId}", habilitationId, userId);
            throw;
        }
    }

    public async Task AddAsync(UserHabilitationDTOForm dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.UserId))
            {
                throw new ArgumentException("L'ID de l'utilisateur ne peut pas être null ou vide");
            }

            await _repository.SynchronizeHabilitationsAsync(dto.UserId, dto.HabilitationIds);
            // await _userRoleRepository.SynchronizeRolesAsync(dto.UserId, dto.RoleIds);

            await _repository.SaveChangesAsync();

            _logger.LogInformation("Relations utilisateur-habilitation et utilisateur-rôle mises à jour avec succès pour UserId: {UserId}", dto.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la mise à jour des relations utilisateur-habilitation et utilisateur-rôle pour UserId: {UserId}", dto?.UserId);
            throw;
        }
    }

    public async Task UpdateAsync(UserHabilitation userHabilitation)
    {
        try
        {
            if (userHabilitation == null)
            {
                throw new ArgumentNullException(nameof(userHabilitation), "Le user_habilitation ne peut pas être null");
            }

            if (string.IsNullOrWhiteSpace(userHabilitation.HabilitationId) || string.IsNullOrWhiteSpace(userHabilitation.UserId))
            {
                throw new ArgumentException("Les IDs d'habilitation et d'utilisateur ne peuvent pas être null ou vides", nameof(userHabilitation));
            }

            await _repository.UpdateAsync(userHabilitation);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("User_habilitation mis à jour avec succès pour HabilitationId: {HabilitationId} et UserId: {UserId}", userHabilitation.HabilitationId, userHabilitation.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la mise à jour du user_habilitation avec HabilitationId: {HabilitationId} et UserId: {UserId}", userHabilitation?.HabilitationId, userHabilitation?.UserId);
            throw;
        }
    }

    public async Task DeleteAsync(string habilitationId, string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(habilitationId) || string.IsNullOrWhiteSpace(userId))
            {
                throw new ArgumentException("Les IDs d'habilitation et d'utilisateur ne peuvent pas être null ou vides");
            }

            await _repository.DeleteAsync(habilitationId, userId);
            await _repository.SaveChangesAsync();

            _logger.LogInformation("User_habilitation supprimé avec succès pour HabilitationId: {HabilitationId} et UserId: {UserId}", habilitationId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la suppression du user_habilitation avec HabilitationId: {HabilitationId} et UserId: {UserId}", habilitationId, userId);
            throw;
        }
    }
}