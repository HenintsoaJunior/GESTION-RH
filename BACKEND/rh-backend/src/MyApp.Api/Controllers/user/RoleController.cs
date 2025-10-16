using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;
using System.Security.Claims;

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
        [AllowAnonymous]
        public async Task<ActionResult> GetAllRoles()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var roles = await _roleService.GetAllAsync();
                return Ok(new { data = roles, status = 200, message = "success" });
            }
            catch (ArgumentException)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "error" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la récupération de tous les rôles");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> UpdateRole(string id, [FromBody] RoleUpdateDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "invalid model" });
            }

            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                await _roleService.UpdateAsync(id, dto, dto.UserId);
                var updatedRole = await _roleService.GetByIdAsync(id);
                return Ok(new { data = updatedRole, status = 200, message = "success" });
            }
            catch (ArgumentException)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "error" });
            }
            catch (InvalidOperationException)
            {
                return NotFound(new { data = (object?)null, status = 404, message = "not found" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la mise à jour du rôle {RoleId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> DeleteRole(string id,[FromBody] RoleDeleteDto dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            
            try
            {
                await _roleService.DeleteAsync(id, dto.UserId);
                return Ok(new { data = (object?)null, status = 200, message = "success" });
            }
            catch (ArgumentException)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "error" });
            }
            catch (InvalidOperationException)
            {
                return NotFound(new { data = (object?)null, status = 404, message = "not found" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la suppression du rôle {RoleId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}