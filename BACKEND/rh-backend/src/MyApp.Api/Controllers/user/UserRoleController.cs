using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.user
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserRoleController : ControllerBase
    {
        private readonly IUserRoleService _userRoleService;
        private readonly ILogger<UserRoleController> _logger;

        public UserRoleController(IUserRoleService userRoleService, ILogger<UserRoleController> logger)
        {
            _userRoleService = userRoleService;
            _logger = logger;
        }

        // GET: api/UserRole
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserRole>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les relations utilisateur-rôle");
                var userRoles = await _userRoleService.GetAllAsync();
                return Ok(userRoles);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les relations utilisateur-rôle");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des relations utilisateur-rôle");
            }
        }

        // GET: api/UserRole/{userId}/{roleId}
        [HttpGet("{userId}/{roleId}")]
        public async Task<ActionResult<UserRole>> GetByKeys(string userId, string roleId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(roleId))
                {
                    _logger.LogWarning("Tentative d'accès à une relation utilisateur-rôle avec UserId ou RoleId invalide");
                    return BadRequest("Les IDs de l'utilisateur et du rôle doivent être fournis");
                }

                _logger.LogInformation("Récupération de la relation utilisateur-rôle pour UserId {UserId} et RoleId {RoleId}", userId, roleId);
                var userRole = await _userRoleService.GetByKeysAsync(userId, roleId);

                if (userRole == null)
                {
                    _logger.LogWarning("Relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId} non trouvée", userId, roleId);
                    return NotFound("Relation utilisateur-rôle non trouvée");
                }

                return Ok(userRole);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la relation utilisateur-rôle pour UserId {UserId} et RoleId {RoleId}", userId, roleId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de la relation utilisateur-rôle");
            }
        }

        // POST: api/UserRole
        [HttpPost]
        public async Task<ActionResult<UserRole>> Create([FromBody] UserRoleDTOForm? dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.UserId) || string.IsNullOrWhiteSpace(dto.RoleId))
                {
                    _logger.LogWarning("Tentative de création d'une relation utilisateur-rôle avec des données invalides");
                    return BadRequest("Les données de la relation utilisateur-rôle doivent être valides");
                }

                _logger.LogInformation("Création d'une nouvelle relation utilisateur-rôle pour UserId {UserId} et RoleId {RoleId}", dto.UserId, dto.RoleId);
                var userRole = await _userRoleService.CreateAsync(dto);

                return CreatedAtAction(nameof(GetByKeys), new { userId = userRole.UserId, roleId = userRole.RoleId }, userRole);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la relation utilisateur-rôle pour UserId {UserId} et RoleId {RoleId}", dto?.UserId, dto?.RoleId);
                return StatusCode(500, "Une erreur est survenue lors de la création de la relation utilisateur-rôle");
            }
        }

        // POST: api/UserRole/bulk
        [HttpPost("bulk")]
        public async Task<IActionResult> CreateBulk([FromBody] UserRoleDtoFormBulk? dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.UserId) || !dto.RoleIds.Any())
                {
                    _logger.LogWarning("Tentative de création en masse de relations utilisateur-rôle avec des données invalides");
                    return BadRequest("L'ID de l'utilisateur et la liste des IDs de rôles doivent être valides");
                }

                _logger.LogInformation("Création en masse de relations utilisateur-rôle pour UserId {UserId}", dto.UserId);
                await _userRoleService.AddAsync(dto);

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création en masse des relations utilisateur-rôle pour UserId {UserId}", dto?.UserId);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour des relations utilisateur-rôle");
            }
        }

        // PUT: api/UserRole
        [HttpPut]
        public async Task<ActionResult<UserRole>> Update([FromBody] UserRoleDTOForm? dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.UserId) || string.IsNullOrWhiteSpace(dto.RoleId))
                {
                    _logger.LogWarning("Tentative de mise à jour d'une relation utilisateur-rôle avec des données invalides");
                    return BadRequest("Les données de la relation utilisateur-rôle doivent être valides");
                }

                _logger.LogInformation("Mise à jour de la relation utilisateur-rôle pour UserId {UserId} et RoleId {RoleId}", dto.UserId, dto.RoleId);
                var userRole = await _userRoleService.UpdateAsync(dto);

                if (userRole == null)
                {
                    _logger.LogWarning("Relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId} non trouvée pour mise à jour", dto.UserId, dto.RoleId);
                    return NotFound("Relation utilisateur-rôle non trouvée");
                }

                return Ok(userRole);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la relation utilisateur-rôle pour UserId {UserId} et RoleId {RoleId}", dto?.UserId, dto?.RoleId);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de la relation utilisateur-rôle");
            }
        }

        // DELETE: api/UserRole/{userId}/{roleId}
        [HttpDelete("{userId}/{roleId}")]
        public async Task<IActionResult> Delete(string userId, string roleId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(roleId))
                {
                    _logger.LogWarning("Tentative de suppression d'une relation utilisateur-rôle avec UserId ou RoleId invalide");
                    return BadRequest("Les IDs de l'utilisateur et du rôle doivent être fournis");
                }

                _logger.LogInformation("Suppression de la relation utilisateur-rôle pour UserId {UserId} et RoleId {RoleId}", userId, roleId);
                var deleted = await _userRoleService.DeleteAsync(userId, roleId);

                if (!deleted)
                {
                    _logger.LogWarning("Relation utilisateur-rôle avec UserId {UserId} et RoleId {RoleId} non trouvée pour suppression", userId, roleId);
                    return NotFound("Relation utilisateur-rôle non trouvée");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la relation utilisateur-rôle pour UserId {UserId} et RoleId {RoleId}", userId, roleId);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de la relation utilisateur-rôle");
            }
        }
    }
}