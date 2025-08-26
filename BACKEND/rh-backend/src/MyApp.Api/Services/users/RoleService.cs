using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Repositories.users;
using MyApp.Api.Utils.generator;

namespace MyApp.Api.Services.users;

public interface IRoleService
    {
        Task<IEnumerable<Role>> GetAllAsync();
        Task<Role?> GetByIdAsync(string id);
        Task AddAsync(RoleDTOForm dto);
        Task UpdateAsync(RoleDTOFormUpdate role);
        Task DeleteAsync(string id);
    }

    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _repository;
        private readonly ISequenceGenerator _sequenceGenerator;
        private readonly ILogger<RoleService> _logger;

        public RoleService(
            IRoleRepository repository,
            ISequenceGenerator sequenceGenerator,
            ILogger<RoleService> logger)
        {
            _repository = repository;
            _sequenceGenerator = sequenceGenerator;
            _logger = logger;
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

                _logger.LogInformation("Rôle ajouté avec succès avec l'ID: {RoleId}", role.RoleId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout du rôle");
                throw;
            }
        }

        public async Task UpdateAsync(RoleDTOFormUpdate roleDto)
        {
            try
            {
                if (roleDto == null)
                {
                    _logger.LogWarning("Tentative de mise à jour avec un RoleDTOForm null");
                    throw new ArgumentNullException(nameof(roleDto), "Les données du rôle ne peuvent pas être nulles");
                }
        
                var existingRole = await _repository.GetByIdAsync(roleDto.RoleId);
                if (existingRole == null)
                {
                    throw new InvalidOperationException($"Le rôle avec l'ID {roleDto.RoleId} n'existe pas");
                }

                existingRole.Name = roleDto.Name;
                existingRole.Description = roleDto.Description;
                
                await _repository.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du rôle avec le nom: {Name}", roleDto?.Name);
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    throw new ArgumentException("L'ID du rôle ne peut pas être null ou vide", nameof(id));
                }

                await _repository.DeleteAsync(id);
                await _repository.SaveChangesAsync();

                _logger.LogInformation("Rôle supprimé avec succès pour l'ID: {RoleId}", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du rôle avec l'ID: {RoleId}", id);
                throw;
            }
        }
    }