using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;

namespace MyApp.Api.Controllers.user
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController(
        IRoleService roleService,
        IRoleHabilitationService roleHabilitationService,
        IHabilitationService habilitationService,
        IUserRoleService userRoleService,
        ILogger<RoleController> logger)
        : ControllerBase
    {
        private readonly ILogger<RoleController> _logger = logger;

        // -------------------- RÔLES --------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetAllRoles()
        {
            try
            {
                var roles = await roleService.GetAllAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les rôles");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des rôles");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetRoleById(string id)
        {
            try
            {
                var role = await roleService.GetByIdAsync(id);
                if (role != null) return Ok(role);
                _logger.LogWarning("Rôle avec ID {RoleId} non trouvé", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du rôle avec ID {RoleId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du rôle");
            }
        }

        [HttpPost]
        public async Task<ActionResult> CreateRole([FromBody] RoleDTOForm role)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await roleService.AddAsync(role);
                return Ok(role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création d'un rôle");
                return StatusCode(500, "Une erreur est survenue lors de la création du rôle");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateRole(string id, [FromBody] Role role)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != role.RoleId)
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'entité.");

                var existing = await roleService.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de la mise à jour, rôle avec ID {RoleId} introuvable", id);
                    return NotFound();
                }

                await roleService.UpdateAsync(role);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du rôle avec ID {RoleId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du rôle");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteRole(string id)
        {
            try
            {
                var existing = await roleService.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de suppression, rôle avec ID {RoleId} introuvable", id);
                    return NotFound();
                }

                await roleService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du rôle avec ID {RoleId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du rôle");
            }
        }

        // -------------------- HABILITATIONS --------------------
        [HttpGet("habilitations")]
        public async Task<ActionResult<IEnumerable<Habilitation>>> GetAllHabilitations()
        {
            try
            {
                var habilitations = await habilitationService.GetAllAsync();
                return Ok(habilitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les habilitations");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des habilitations");
            }
        }

        [HttpGet("habilitations/{id}")]
        public async Task<ActionResult<Habilitation>> GetHabilitationById(string id)
        {
            try
            {
                var habilitation = await habilitationService.GetByIdAsync(id);
                if (habilitation != null) return Ok(habilitation);
                _logger.LogWarning("Habilitation avec ID {HabilitationId} non trouvée", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'habilitation avec ID {HabilitationId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de l'habilitation");
            }
        }

        [HttpPost("habilitations")]
        public async Task<ActionResult> CreateHabilitation([FromBody] HabilitationDTOForm habilitation)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await habilitationService.AddAsync(habilitation);
                return Ok(habilitation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création d'une habilitation");
                return StatusCode(500, "Une erreur est survenue lors de la création de l'habilitation");
            }
        }

        [HttpPut("habilitations/{id}")]
        public async Task<ActionResult> UpdateHabilitation(string id, [FromBody] Habilitation habilitation)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != habilitation.HabilitationId)
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'entité.");

                var existing = await habilitationService.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de la mise à jour, habilitation avec ID {HabilitationId} introuvable", id);
                    return NotFound();
                }

                await habilitationService.UpdateAsync(habilitation);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'habilitation avec ID {HabilitationId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de l'habilitation");
            }
        }

        [HttpDelete("habilitations/{id}")]
        public async Task<ActionResult> DeleteHabilitation(string id)
        {
            try
            {
                var existing = await habilitationService.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de suppression, habilitation avec ID {HabilitationId} introuvable", id);
                    return NotFound();
                }

                await habilitationService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'habilitation avec ID {HabilitationId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de l'habilitation");
            }
        }

        // -------------------- ROLE-HABILITATIONS --------------------
        [HttpGet("role-habilitations")]
        public async Task<ActionResult<IEnumerable<RoleHabilitation>>> GetAllRoleHabilitations()
        {
            try
            {
                var roleHabilitations = await roleHabilitationService.GetAllAsync();
                return Ok(roleHabilitations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les relations rôle-habilitation");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des relations rôle-habilitation");
            }
        }

        [HttpGet("role-habilitations/{habilitationId}/{roleId}")]
        public async Task<ActionResult<RoleHabilitation>> GetRoleHabilitation(string habilitationId, string roleId)
        {
            try
            {
                var roleHabilitation = await roleHabilitationService.GetByKeysAsync(habilitationId, roleId);
                if (roleHabilitation == null)
                {
                    _logger.LogWarning("Relation rôle-habilitation avec HabilitationId {HabilitationId} et RoleId {RoleId} non trouvée", habilitationId, roleId);
                    return NotFound();
                }
                return Ok(roleHabilitation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la relation rôle-habilitation avec HabilitationId {HabilitationId} et RoleId {RoleId}", habilitationId, roleId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de la relation rôle-habilitation");
            }
        }

        [HttpPost("role-habilitations")]
        public async Task<ActionResult> CreateRoleHabilitation([FromBody] RoleHabilitationDTOForm roleHabilitation)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await roleHabilitationService.AddAsync(roleHabilitation);
                return CreatedAtAction(nameof(GetRoleHabilitation), new { habilitationId = roleHabilitation.HabilitationId, roleId = roleHabilitation.RoleId }, roleHabilitation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création d'une relation rôle-habilitation");
                return StatusCode(500, "Une erreur est survenue lors de la création de la relation rôle-habilitation");
            }
        }

        [HttpPut("role-habilitations")]
        public async Task<ActionResult> UpdateRoleHabilitation([FromBody] RoleHabilitation roleHabilitation)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var existing = await roleHabilitationService.GetByKeysAsync(roleHabilitation.HabilitationId, roleHabilitation.RoleId);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de la mise à jour, relation rôle-habilitation avec HabilitationId {HabilitationId} et RoleId {RoleId} introuvable", roleHabilitation.HabilitationId, roleHabilitation.RoleId);
                    return NotFound();
                }

                await roleHabilitationService.UpdateAsync(roleHabilitation);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la relation rôle-habilitation avec HabilitationId {HabilitationId} et RoleId {RoleId}", roleHabilitation.HabilitationId, roleHabilitation.RoleId);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de la relation rôle-habilitation");
            }
        }

        [HttpDelete("role-habilitations/{habilitationId}/{roleId}")]
        public async Task<ActionResult> DeleteRoleHabilitation(string habilitationId, string roleId)
        {
            try
            {
                var existing = await roleHabilitationService.GetByKeysAsync(habilitationId, roleId);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de suppression, relation rôle-habilitation avec HabilitationId {HabilitationId} et RoleId {RoleId} introuvable", habilitationId, roleId);
                    return NotFound();
                }

                await roleHabilitationService.DeleteAsync(habilitationId, roleId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la relation rôle-habilitation avec HabilitationId {HabilitationId} et RoleId {RoleId}", habilitationId, roleId);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de la relation rôle-habilitation");
            }
        }

        // -------------------- USER-ROLES --------------------
        [HttpGet("user-roles")]
        public async Task<ActionResult<IEnumerable<UserRole>>> GetAllUserRoles()
        {
            try
            {
                var userRoles = await userRoleService.GetAllAsync();
                return Ok(userRoles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les relations utilisateur-rôle");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des relations utilisateur-rôle");
            }
        }

        [HttpGet("user-roles/{userId}/{roleId}")]
        public async Task<ActionResult<UserRole>> GetUserRole(string userId, string roleId)
        {
            try
            {
                var userRole = await userRoleService.GetByKeysAsync(userId, roleId);
                if (userRole == null)
                {
                    _logger.LogWarning("Relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId} non trouvée", userId, roleId);
                    return NotFound();
                }
                return Ok(userRole);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId}", userId, roleId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de la relation utilisateur-rôle");
            }
        }

        [HttpPost("user-roles")]
        public async Task<ActionResult> CreateUserRole([FromBody] UserRoleDTOForm userRole)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var created = await userRoleService.CreateAsync(userRole);
                return CreatedAtAction(nameof(GetUserRole), new { userId = created.UserId, roleId = created.RoleId }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création d'une relation utilisateur-rôle");
                return StatusCode(500, "Une erreur est survenue lors de la création de la relation utilisateur-rôle");
            }
        }

        [HttpPut("user-roles")]
        public async Task<ActionResult> UpdateUserRole([FromBody] UserRoleDTOForm userRole)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var existing = await userRoleService.GetByKeysAsync(userRole.UserId, userRole.RoleId);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de la mise à jour, relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId} introuvable", userRole.UserId, userRole.RoleId);
                    return NotFound();
                }

                await userRoleService.UpdateAsync(userRole);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId}", userRole.UserId, userRole.RoleId);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de la relation utilisateur-rôle");
            }
        }

        [HttpDelete("user-roles/{userId}/{roleId}")]
        public async Task<ActionResult> DeleteUserRole(string userId, string roleId)
        {
            try
            {
                var existing = await userRoleService.GetByKeysAsync(userId, roleId);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de suppression, relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId} introuvable", userId, roleId);
                    return NotFound();
                }

                await userRoleService.DeleteAsync(userId, roleId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId}", userId, roleId);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de la relation utilisateur-rôle");
            }
        }
    }
}
