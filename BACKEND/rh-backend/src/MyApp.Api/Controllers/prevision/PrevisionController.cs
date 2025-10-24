using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.employee;
using MyApp.Api.Services.employee;
using MyApp.Api.Services.prevision;


namespace MyApp.Api.Controllers.prevision
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrevisionController(
        IPrevisionPriceService previsionService,
        ILogger<PrevisionController> logger)
        : ControllerBase
    {

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult> GetAll()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var prevision = await previsionService.GetAllAsync();
                return Ok(new { data = prevision, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de tous les prevision");
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la récupération de tous les prevision");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}