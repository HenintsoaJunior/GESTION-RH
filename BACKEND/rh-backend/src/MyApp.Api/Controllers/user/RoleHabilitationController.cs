using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;

namespace MyApp.Api.Controllers.user
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoleHabilitationController : ControllerBase
    {
        private readonly IRoleHabilitationService _roleHabilitationService;
        private readonly ILogger<RoleHabilitationController> _logger;

        public RoleHabilitationController(IRoleHabilitationService roleHabilitationService, ILogger<RoleHabilitationController> logger)
        {
            _roleHabilitationService = roleHabilitationService;
            _logger = logger;
        }

        [HttpPost("bulk")]
        [AllowAnonymous] 
        public async Task<ActionResult> CreateBulk([FromBody] RoleHabilitationDTOForm dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                await _roleHabilitationService.AddAsync(dto);

                return Ok(new { data = dto, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la création en masse des relations utilisateur-habilitation pour UserIds {UserIds}", string.Join(",", dto.RoleIds));
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost("create-role")]
        [AllowAnonymous]
        public async Task<ActionResult> CreateRoleWithHabilitations([FromBody] CreateRoleWithHabilitationsDto dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var role = await _roleHabilitationService.CreateRoleWithHabilitationsAsync(dto);

                return Ok(new { data = role, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la création du rôle avec le nom {Name}", dto.Name);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}