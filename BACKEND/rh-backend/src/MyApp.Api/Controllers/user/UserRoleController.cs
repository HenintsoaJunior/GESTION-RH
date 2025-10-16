using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;

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


        [HttpPost("bulk")]
        [AllowAnonymous]
        public async Task<ActionResult> CreateBulk([FromBody] UserRoleDtoFormBulk? dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null || !dto.UserIds.Any() || !dto.RoleIds.Any())
            {
                _logger.LogWarning("Tentative de création en masse de relations utilisateur-rôle avec des données invalides");
                return BadRequest(new { data = (object?)null, status = 400, message = "invalid parameters" });
            }

            try
            {
                _logger.LogInformation("Création en masse de relations utilisateur-rôle pour UserIds {UserIds}", string.Join(", ", dto.UserIds));
                await _userRoleService.AddAsync(dto);

                return Ok(new { data = dto, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                var userIdsLog = dto?.UserIds != null ? string.Join(", ", dto.UserIds) : "inconnus";
                _logger.LogError(e, "Erreur lors de la création en masse des relations utilisateur-rôle pour UserIds {UserIds}", userIdsLog);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost("bulk/remove")]
        [AllowAnonymous]
        public async Task<ActionResult> RemoveBulk([FromBody] UserRoleDtoFormBulk? dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null || !dto.UserIds.Any() || !dto.RoleIds.Any())
            {
                _logger.LogWarning("Tentative de suppression en masse de relations utilisateur-rôle avec des données invalides");
                return BadRequest(new { data = (object?)null, status = 400, message = "invalid parameters" });
            }

            try
            {
                _logger.LogInformation("Suppression en masse de relations utilisateur-rôle pour UserIds {UserIds}", string.Join(", ", dto.UserIds));
                await _userRoleService.RemoveRolesAsync(dto);

                return Ok(new { data = dto, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                var userIdsLog = dto?.UserIds != null ? string.Join(", ", dto.UserIds) : "inconnus";
                _logger.LogError(e, "Erreur lors de la suppression en masse des relations utilisateur-rôle pour UserIds {UserIds}", userIdsLog);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}