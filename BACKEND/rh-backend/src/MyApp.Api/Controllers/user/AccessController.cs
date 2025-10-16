using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Controllers.user
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccessController : ControllerBase
    {
        private readonly IRoleService _roleService;
        private readonly IRoleHabilitationService _roleHabilitationService;
        private readonly IHabilitationService _habilitationService;
        private readonly IUserRoleService _userRoleService;
        private readonly IHabitationGroupService _habitationGroupService;
        private readonly ILogger<AccessController> _logger;

        public AccessController(
            IRoleService roleService,
            IRoleHabilitationService roleHabilitationService,
            IHabilitationService habilitationService,
            IHabitationGroupService habitationGroupService,
            IUserRoleService userRoleService,
            ILogger<AccessController> logger)
        {
            _roleService = roleService;
            _roleHabilitationService = roleHabilitationService;
            _habilitationService = habilitationService;
            _habitationGroupService = habitationGroupService;
            _userRoleService = userRoleService;
            _logger = logger;
        }

        // -------------------- RÔLES --------------------
        [HttpGet("role")]
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

        [HttpGet("role-info")]
        [AllowAnonymous]
        public async Task<ActionResult> GetAllInfoRoles()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var roles = await _roleService.GetAllInfoAsync();
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

        // -------------------- HABILITATIONS --------------------
        [HttpGet("habilitations-group")]
        [AllowAnonymous]
        public async Task<ActionResult> GetAllHabilitationsGroup()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }
            try
            {
                var groups = await _habitationGroupService.GetAllAsync();
                return Ok(new { data = groups, status = 200, message = "success" });
            }
            catch (ArgumentException)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "error" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les groupes d'habilitations");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("habilitations")]
        [AllowAnonymous]
        public async Task<ActionResult> GetAllHabilitations()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }
            try
            {
                var habilitations = await _habilitationService.GetAllAsync();
                return Ok(new { data = habilitations, status = 200, message = "success" });
            }
            catch (ArgumentException)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "error" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les habilitations");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost("habilitations-by-roles")]
        [AllowAnonymous]
        public async Task<ActionResult> GetHabilitationIdsByRoleIds([FromBody] RoleIdsRequest request)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (request == null || request.RoleIds == null || !request.RoleIds.Any())
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "La liste des IDs de rôles ne peut pas être null ou vide" });
            }

            try
            {
                var habilitationIds = await _roleHabilitationService.GetHabilitationIdsByRoleIdsAsync(request);
                return Ok(new { data = habilitationIds, status = 200, message = "success" });
            }
            catch (ArgumentException)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "error" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des IDs d'habilitations par IDs de rôles: {RoleIds}", string.Join(", ", request.RoleIds));
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}