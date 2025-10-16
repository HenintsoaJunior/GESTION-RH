using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;

namespace MyApp.Api.Controllers.user
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserHabilitationController : ControllerBase
    {
        private readonly IUserHabilitationService _userHabilitationService;
        private readonly ILogger<UserHabilitationController> _logger;

        public UserHabilitationController(IUserHabilitationService userHabilitationService, ILogger<UserHabilitationController> logger)
        {
            _userHabilitationService = userHabilitationService;
            _logger = logger;
        }

        [HttpPost("bulk")]
        [AllowAnonymous] 
        public async Task<ActionResult> CreateBulk([FromBody] UserHabilitationDTOForm dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                await _userHabilitationService.AddAsync(dto);

                return Ok(new { data = dto, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la création en masse des relations utilisateur-habilitation pour UserIds {UserIds}", string.Join(",", dto.UserId));
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}