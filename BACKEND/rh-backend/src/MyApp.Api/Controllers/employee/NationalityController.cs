using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.employee;
using MyApp.Api.Services.employee;

namespace MyApp.Api.Controllers.employee
{
    [Route("api/[controller]")]
    [ApiController]
    public class NationalityController : ControllerBase
    {
        private readonly INationalityService _nationalityService;
        private readonly ILogger<NationalityController> _logger;

        public NationalityController(INationalityService nationalityService, ILogger<NationalityController> logger)
        {
            _nationalityService = nationalityService ?? throw new ArgumentNullException(nameof(nationalityService));
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
                _logger.LogInformation("Retrieving all nationalities");
                var nationalities = await _nationalityService.GetAllAsync();
                var responseData = nationalities;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving all nationalities");
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Nationality ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving nationality with ID: {NationalityId}", id);
                var nationality = await _nationalityService.GetByIdAsync(id);
                if (nationality == null)
                {
                    _logger.LogWarning("Nationality not found for ID: {NationalityId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Nationality not found" });
                }
                var responseData = nationality;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving nationality with ID: {NationalityId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] CreateNationalityDTO dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Nationality data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Creating new nationality");
                var createdNationality = await _nationalityService.AddAsync(dto);
                var responseData = new { NationalityId = createdNationality.NationalityId };
                return CreatedAtAction(nameof(GetById), new { id = createdNationality.NationalityId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error creating nationality");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] Nationality nationality)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Nationality ID cannot be null or empty" });
            }

            if (nationality == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Nationality data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            if (id != nationality.NationalityId)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "The ID in the URL does not match the entity." });
            }

            try
            {
                _logger.LogInformation("Updating nationality with ID: {NationalityId}", id);
                await _nationalityService.UpdateAsync(nationality);
                var responseData = new { message = $"Nationality with ID {id} successfully updated", data = nationality };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error updating nationality with ID: {NationalityId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Delete(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Nationality ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Deleting nationality with ID: {NationalityId}", id);
                var nationality = await _nationalityService.GetByIdAsync(id);
                if (nationality == null)
                {
                    _logger.LogWarning("Nationality not found for ID: {NationalityId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Nationality not found" });
                }

                await _nationalityService.DeleteAsync(id);
                var responseData = new { message = $"Nationality with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting nationality with ID: {NationalityId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}