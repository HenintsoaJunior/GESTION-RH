using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Services.recruitment;

namespace MyApp.Api.Controllers.recruitment;

[ApiController]
[Route("api/recruitment/job-descriptions")]
public class JobDescriptionController(IJobDescriptionService service) 
 : ControllerBase
{
    private readonly IJobDescriptionService _service = service;


    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> AddJobDescription([FromBody] 
     JobDescriptionFormDTO data) {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            await _service.AddJobDescription(data);
            return Ok(new { data = (object?)null, status = 200, message = "Fiche de poste créée avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpGet("requests/{requestId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetJobDescription([FromRoute] string requestId) {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            var jobDescription = await _service.GetJobDescription(requestId);
            return Ok(new { data = jobDescription, status = 200, message = "Fiche de poste trouvée avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpGet("requests/{requestId}/has")]
    [AllowAnonymous]
    public async Task<IActionResult> HasJobDescription([FromRoute] string requestId) {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            var value = await _service.HasJobDescription(requestId);
            return Ok(new { data = value, status = 200, message = "Réponse obtenue avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }
}
