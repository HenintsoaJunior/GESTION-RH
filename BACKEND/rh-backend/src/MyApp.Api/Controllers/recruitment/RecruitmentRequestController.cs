using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Services.recruitment;

namespace MyApp.Api.Controllers.recruitment;

[ApiController]
[Route("api/recruitment/requests")]
public class RecruitmentRequestController(IRecruitmentRequestService _service, 
    IRequestValidationService _validationService) 
 : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> SearchRequests([FromQuery] FilterRequestListDTO filters, 
        [FromQuery] int page=1, [FromQuery] int pageSize=10
    ) {
        var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if(string.IsNullOrEmpty(userEmail)) {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });   
        }

        try {
            var (results, totalCount) = await _service.SearchRequests(filters, userEmail, page, pageSize);
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


    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRequestById([FromRoute] string id) {
        if(!User.Identity?.IsAuthenticated ?? true) {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try {
            var lastRequest = await _service.GetById(id);

            return Ok(new {
                data = lastRequest, status = 200, message = "success"
            });
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
    public async Task<IActionResult> AddRequest([FromBody] RequestFormDTO data) {
        if(!User.Identity?.IsAuthenticated ?? true) {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try {
            string reqId = await _service.AddRequest(data);
            return Ok(new { data = reqId, status = 200, message = "Demande créée avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpGet("statuses")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllStatuses() {
        if(!User.Identity?.IsAuthenticated ?? true) {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try {
            var statuses = await _service.GetAllStatuses();
            return Ok(new { data = statuses, status = 200, message = "success" });
        }
        catch (ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch (Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpGet("{id}/details")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRequestDetails([FromRoute] string id) {
        if(!User.Identity?.IsAuthenticated ?? true) {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try {
            var details = await _service.GetRequestDetails(id);
            var validations = await _service.GetValidationsByRequestId(id);

            return Ok(new {
                data = new RequestDetailsResponseDTO {
                    Details = details,
                    Validations = validations
                },
                status = 200,
                message = "success"
            });
        }
        catch (ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch (Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpDelete("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> DeleteRequest([FromRoute] string id) {
        if(!User.Identity?.IsAuthenticated ?? true) {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try {
            await _service.DeleteRequest(id);
            return Ok(new { data = id, status = 200, message = "success" });
        }
        catch (ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch (Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpGet("{id}/validators")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRequestValidators([FromRoute] string id) {
        if(!User.Identity?.IsAuthenticated ?? true) {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try {
            var results = await _validationService.GetAllDirectorValidator(id);
            return Ok(new { data = results, status = 200, message = "success" });
        }
        catch (ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch (Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpPost("validate")]
    [AllowAnonymous]
    public async Task<IActionResult> ValidateRecruitmentRequest([FromBody] CreateRequestValidationDTO data) {
        if(!User.Identity?.IsAuthenticated ?? true) {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try {
            await _validationService.DoValidationForRequest(data);
            return Ok(new { data = (object?)null, status = 200, message = "Validation faite avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpPost("pended")]
    [AllowAnonymous]
    public async Task<IActionResult> SearchPendedRequests([FromBody] string validatorId,
        [FromQuery] FilterRequestListDTO filters, [FromQuery] int page=1, [FromQuery] int pageSize=10
    ) {
        if(!User.Identity?.IsAuthenticated ?? true) {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try {
            var (results, totalCount) = await _validationService.GetAllPendedRecruitmentRequest(validatorId, filters, page, pageSize);
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


    [HttpGet("check-validator")]
    [AllowAnonymous]
    public async Task<IActionResult> HasRequestsToValidate([FromQuery] string user) {
        if(!User.Identity?.IsAuthenticated ?? true) {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try {
            var hasRequests = await _validationService.HasRequestsToValidate(user);
            return Ok(new { data = hasRequests, status = 200, message = "success" });
        }
        catch (ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch (Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpPut("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateRequest([FromRoute] string id,
     [FromBody] RequestFormDTO data) {
        if(!User.Identity?.IsAuthenticated ?? true) {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try {
            await _service.UpdateRequest(id, data);
            return Ok(new { data = (object?)null, status = 200, message = "Demande mise à jour avec succès" });
        }
        catch (ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch (Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }
}
