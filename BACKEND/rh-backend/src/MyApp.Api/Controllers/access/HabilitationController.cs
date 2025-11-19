using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;

namespace MyApp.Api.Controllers.users
{
    [Route("api/[controller]")]
    [ApiController]
    public class HabilitationController : ControllerBase
    {
        private readonly IHabilitationService _habilitationService;

        public HabilitationController(IHabilitationService habilitationService)
        {
            _habilitationService = habilitationService ?? throw new ArgumentNullException(nameof(habilitationService));
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string? label = null)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (page < 1)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Page must be greater than 0" });
            }

            if (pageSize < 1 || pageSize > 100)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "PageSize must be between 1 and 100" });
            }

            try
            {
                var (habilitations, totalCount) = await _habilitationService.GetAllPaginatedAsync(page, pageSize, label);
                var responseData = new { items = habilitations, total = totalCount, page = page, pageSize = pageSize };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}