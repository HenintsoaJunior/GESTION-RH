using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Services.recruitment;

namespace MyApp.Api.Controllers.recruitment;

[ApiController]
[Route("api/recruitment/requests")]
public class RecruitmentRequestController(IRequestService _service) 
 : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> SearchRequests([FromQuery] FilterRequestListDTO filters, 
        [FromQuery] int page=1, [FromQuery] int pageSize=10
    ) {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            var (results, totalCount) = await _service.SearchRequests(filters, page, pageSize);
            var responseData = new { results, totalCount, page, pageSize };
            return Ok(new { data = responseData, status = 200, message = "success" });
        }
        catch (ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch (Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> AddRequest([FromBody] RequestFormDTO data)
    {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            await _service.AddRequest(data);
            return Ok(new { data = (object?)null, status = 200, message = "Demande ajoutée avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }
}
