using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.dto.compensation_scale;
using MyApp.Api.Services.mission;
using System.Security.Claims;

namespace MyApp.Api.Controllers.mission
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompensationScaleController : ControllerBase
    {
        private readonly ICompensationScaleService _service;
        private readonly ILogger<CompensationScaleController> _logger;

        public CompensationScaleController(ICompensationScaleService service, ILogger<CompensationScaleController> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

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
                _logger.LogInformation("Retrieving all compensation scales");
                var results = await _service.GetAllAsync();
                var responseData = results;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving all compensation scales");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetById(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "CompensationScale ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving compensation scale with ID: {CompensationScaleId}", id);
                var result = await _service.GetByIdAsync(id);
                if (result == null)
                {
                    _logger.LogWarning("CompensationScale not found for ID: {CompensationScaleId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "CompensationScale not found" });
                }
                var responseData = result;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving compensation scale with ID: {CompensationScaleId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost("search")]
        [AllowAnonymous]
        public async Task<ActionResult> GetByCriteria([FromBody] CompensationScaleDTOForm criteria)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (criteria == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Criteria cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Searching compensation scales by criteria");
                var results = await _service.GetByCriteriaAsync(criteria);
                var responseData = results;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error searching compensation scales");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] CompensationScaleDTOForm dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "CompensationScale data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Creating new compensation scale");
                var createdId = await _service.CreateAsync(dto);
                var responseData = new { CompensationScaleId = createdId };
                return CreatedAtAction(nameof(GetById), new { id = createdId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error creating compensation scale");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] CompensationScaleDTOForm dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "CompensationScale ID cannot be null or empty" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "CompensationScale data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Updating compensation scale with ID: {CompensationScaleId}", id);
                var success = await _service.UpdateAsync(id, dto);
                if (!success)
                {
                    _logger.LogWarning("CompensationScale not found for update with ID: {CompensationScaleId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "CompensationScale not found" });
                }
                var responseData = new { message = $"CompensationScale with ID {id} successfully updated" };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error updating compensation scale with ID: {CompensationScaleId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Delete(string id, [FromQuery] string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "CompensationScale ID cannot be null or empty" });
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "User ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Deleting compensation scale with ID: {CompensationScaleId}", id);
                var success = await _service.DeleteAsync(id, userId);
                if (!success)
                {
                    _logger.LogWarning("CompensationScale not found for delete with ID: {CompensationScaleId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "CompensationScale not found" });
                }
                var responseData = new { message = $"CompensationScale with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting compensation scale with ID: {CompensationScaleId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost("bulk-sync")]
        [AllowAnonymous]
        public async Task<ActionResult> BulkSync([FromBody] BulkCompensationScaleSyncRequest request)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (request == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Bulk sync request cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "User ID not found in token" });
            }

            try
            {
                _logger.LogInformation("Performing bulk sync for {CategoryCount} categories", request.CategoryIds?.Count ?? 0);
                var createdIds = await _service.BulkSyncAsync(request, userId);
                var responseData = new { CreatedIds = createdIds, Message = "Bulk sync completed successfully" };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error performing bulk sync");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}