using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.recruitment;

namespace MyApp.Api.Controllers.recruitment;

[ApiController]
[Route("api/recruitment/validations")]
public class RequestValidationController
(IRequestValidationService _service)  : ControllerBase
{
    [HttpGet("all-directors")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllFirectors() {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            var directors = await _service.GetAllDirectors();
            return Ok(new { data = directors, status = 200, message = "success" });
        }
        catch (ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch (Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }
}
