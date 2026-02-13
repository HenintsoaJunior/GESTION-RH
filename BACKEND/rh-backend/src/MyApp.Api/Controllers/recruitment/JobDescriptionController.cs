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


    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetJobDescriptionById([FromRoute] string id) {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            var jobDescription = await _service.GetJobDescriptionEditById(id);
            return Ok(new { data = jobDescription, status = 200, message = "Fiche de poste trouvée avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpPut("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateJobDescription([FromRoute] string id, 
        [FromBody] JobDescriptionFormDTO data) {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            await _service.UpdateJobDescription(id, data);
            return Ok(new { data = (object?)null, status = 200, message = "Fiche de poste mise à jour avec succès" });
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

        requestId = requestId.Replace("_", "/");
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
            requestId = requestId.Replace("_", "/");
            var (value, id) = await _service.HasJobDescription(requestId);
            return Ok(new { data = new { value, id }, status = 200, message = "Réponse obtenue avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpGet("can-validate/{userId}")]
    [AllowAnonymous]
    public async Task<IActionResult> CanValidateJobDescription([FromRoute] string userId) {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            var value = await _service.CanValidateJobDescription(userId);
            return Ok(new { data = value, status = 200, message = "Réponse obtenue avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpPost("validate")]
    [AllowAnonymous]
    public async Task<IActionResult> ValidateJobDescription([FromBody] JobDescriptionValidationDTO dto) {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            await _service.ValidateJobDescription(dto);
            return Ok(new { data = (object?)null, status = 200, message = "TDR validé avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpGet("pended")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllPendedJobDescriptions( 
        [FromQuery] FilterRequestListDTO filters, 
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10
    ) {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            var (results, totalCount) = await _service.GetAllPendedJobDescriptions(
                filters, page, pageSize
            );
            var responseData = new { results, totalCount, page, pageSize };
            return Ok(new { 
                data = responseData, status = 200, 
                message = "Liste des TDRs en attente obtenue avec succès" 
            });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }
}
