using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.employee;
using MyApp.Api.Services.employee;

namespace MyApp.Api.Controllers.employee
{
    [Route("api/[controller]")]
    [ApiController]
    public class GenderController : ControllerBase
    {
        private readonly IGenderService _genderService;
        private readonly ILogger<GenderController> _logger;

        public GenderController(IGenderService genderService, ILogger<GenderController> logger)
        {
            _genderService = genderService ?? throw new ArgumentNullException(nameof(genderService));
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
                _logger.LogInformation("Retrieving all genders");
                var genders = await _genderService.GetAllAsync();
                var responseData = genders;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving all genders");
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Gender ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving gender with ID: {GenderId}", id);
                var gender = await _genderService.GetByIdAsync(id);
                if (gender == null)
                {
                    _logger.LogWarning("Gender not found for ID: {GenderId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Gender not found" });
                }
                var responseData = gender;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving gender with ID: {GenderId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] CreateGenderDTO dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Gender data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Creating new gender");
                var createdGender = await _genderService.AddAsync(dto);
                var responseData = new { GenderId = createdGender.GenderId };
                return CreatedAtAction(nameof(GetById), new { id = createdGender.GenderId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error creating gender");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] Gender gender)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Gender ID cannot be null or empty" });
            }

            if (gender == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Gender data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            if (id != gender.GenderId)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "The ID in the URL does not match the entity." });
            }

            try
            {
                _logger.LogInformation("Updating gender with ID: {GenderId}", id);
                await _genderService.UpdateAsync(id, gender);
                var responseData = new { message = $"Gender with ID {id} successfully updated", data = gender };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error updating gender with ID: {GenderId}", id);
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Gender ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Deleting gender with ID: {GenderId}", id);
                var gender = await _genderService.GetByIdAsync(id);
                if (gender == null)
                {
                    _logger.LogWarning("Gender not found for ID: {GenderId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Gender not found" });
                }

                await _genderService.DeleteAsync(id);
                var responseData = new { message = $"Gender with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting gender with ID: {GenderId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}