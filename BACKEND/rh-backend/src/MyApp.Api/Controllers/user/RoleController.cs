using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;

namespace MyApp.Api.Controllers.user
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly IRoleHabilitationService _roleHabilitationService;
        private readonly IHabilitationService _habilitationService;
        private readonly IUserRoleService _userRoleService;
        private readonly ILogger<RoleController> _logger;

        public RoleController(
            IRoleService roleService,
            IRoleHabilitationService roleHabilitationService,
            IHabilitationService habilitationService,
            IUserRoleService userRoleService,
            ILogger<RoleController> logger)
        {
            _roleService = roleService;
            _roleHabilitationService = roleHabilitationService;
            _habilitationService = habilitationService;
            _userRoleService = userRoleService;
            _logger = logger;
        }

        // -------------------- RÔLES --------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetAllRoles()
        {
            try
            {
                var roles = await _roleService.GetAllAsync();
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
                var role = await _roleService.GetByIdAsync(id);
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

                await _roleService.AddAsync(role);
                return CreatedAtAction(nameof(GetRoleById), new { id = role.UserId }, role);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création d'un rôle");
                return StatusCode(500, "Une erreur est survenue lors de la création du rôle");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateRole(string id, [FromBody] RoleDTOForm role)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var existing = await _roleService.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de la mise à jour, rôle avec ID {RoleId} introuvable", id);
                    return NotFound();
                }

                await _roleService.UpdateAsync(id, role);
                return Ok(new { message = "Rôle mis à jour avec succès", roleId = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du rôle avec ID {RoleId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du rôle");
            }
        }

        [HttpDelete("{id}/{userId}")]
        public async Task<ActionResult> DeleteRole(string id, string userId)
        {
            try
            {
                var existing = await _roleService.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de suppression, rôle avec ID {RoleId} introuvable", id);
                    return NotFound(new { Message = $"Rôle avec ID {id} introuvable" });
                }

                await _roleService.DeleteAsync(id, userId);
                return Ok(new { Message = $"Rôle avec ID {id} supprimé avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du rôle avec ID {RoleId}", id);
                return StatusCode(500, new { Message = "Une erreur est survenue lors de la suppression du rôle", Error = ex.Message });
            }
        }

        // -------------------- HABILITATIONS --------------------
        [HttpGet("habilitations")]
        public async Task<ActionResult<IEnumerable<Habilitation>>> GetAllHabilitations()
        {
            try
            {
                var habilitations = await _habilitationService.GetAllAsync();
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
                var habilitation = await _habilitationService.GetByIdAsync(id);
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

        [HttpPost("habilitations/{userId}")]
        public async Task<ActionResult> CreateHabilitation([FromBody] HabilitationDTOForm habilitation, string userId)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await _habilitationService.AddAsync(habilitation, userId);
                return Ok(habilitation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création d'une habilitation");
                return StatusCode(500, "Une erreur est survenue lors de la création de l'habilitation");
            }
        }

        [HttpPut("habilitations/{id}/{userId}")]
        public async Task<ActionResult> UpdateHabilitation(string id, [FromBody] HabilitationDTOForm habilitation, string userId)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                
                var existing = await _habilitationService.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de la mise à jour, habilitation avec ID {HabilitationId} introuvable", id);
                    return NotFound();
                }

                await _habilitationService.UpdateAsync(id, habilitation, userId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'habilitation avec ID {HabilitationId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de l'habilitation");
            }
        }

        [HttpDelete("habilitations/{id}/{userId}")]
        public async Task<ActionResult> DeleteHabilitation(string id, string userId)
        {
            try
            {
                var existing = await _habilitationService.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de suppression, habilitation avec ID {HabilitationId} introuvable", id);
                    return NotFound();
                }

                await _habilitationService.DeleteAsync(id, userId);
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
                var roleHabilitations = await _roleHabilitationService.GetAllAsync();
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
                var roleHabilitation = await _roleHabilitationService.GetByKeysAsync(habilitationId, roleId);
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

                await _roleHabilitationService.AddAsync(roleHabilitation);
                return CreatedAtAction(nameof(GetRoleHabilitation), new { habilitationId = roleHabilitation.HabilitationIds.FirstOrDefault(), roleId = roleHabilitation.RoleIds.FirstOrDefault() }, roleHabilitation);
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

                var existing = await _roleHabilitationService.GetByKeysAsync(roleHabilitation.HabilitationId, roleHabilitation.RoleId);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de la mise à jour, relation rôle-habilitation avec HabilitationId {HabilitationId} et RoleId {RoleId} introuvable", roleHabilitation.HabilitationId, roleHabilitation.RoleId);
                    return NotFound();
                }

                await _roleHabilitationService.UpdateAsync(roleHabilitation);
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
                var existing = await _roleHabilitationService.GetByKeysAsync(habilitationId, roleId);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de suppression, relation rôle-habilitation avec HabilitationId {HabilitationId} et RoleId {RoleId} introuvable", habilitationId, roleId);
                    return NotFound();
                }

                await _roleHabilitationService.DeleteAsync(habilitationId, roleId);
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
                var userRoles = await _userRoleService.GetAllAsync();
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
                var userRole = await _userRoleService.GetByKeysAsync(userId, roleId);
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

                var created = await _userRoleService.CreateAsync(userRole);
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

                var existing = await _userRoleService.GetByKeysAsync(userRole.UserId, userRole.RoleId);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de la mise à jour, relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId} introuvable", userRole.UserId, userRole.RoleId);
                    return NotFound();
                }

                await _userRoleService.UpdateAsync(userRole);
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
                var existing = await _userRoleService.GetByKeysAsync(userId, roleId);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de suppression, relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId} introuvable", userId, roleId);
                    return NotFound();
                }

                await _userRoleService.DeleteAsync(userId, roleId);
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