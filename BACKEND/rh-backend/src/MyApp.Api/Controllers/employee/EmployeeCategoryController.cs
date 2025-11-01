using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.employee;
using MyApp.Api.Services.employee;

namespace MyApp.Api.Controllers.employee
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeCategoryController : ControllerBase
    {
        private readonly IEmployeeCategoryService _service;
        private readonly ILogger<EmployeeCategoryController> _logger;

        public EmployeeCategoryController(IEmployeeCategoryService service, ILogger<EmployeeCategoryController> logger)
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
                _logger.LogInformation("Retrieving all employee categories");
                var results = await _service.GetAllAsync();
                var responseData = results;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving all employee categories");
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
                return BadRequest(new { data = (object?)null, status = 400, message = "EmployeeCategory ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving employee category with ID: {EmployeeCategoryId}", id);
                var result = await _service.GetByIdAsync(id);
                if (result == null)
                {
                    _logger.LogWarning("EmployeeCategory not found for ID: {EmployeeCategoryId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "EmployeeCategory not found" });
                }
                var responseData = result;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving employee category with ID: {EmployeeCategoryId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] CreateEmployeeCategoryDTO dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "EmployeeCategory data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Creating new employee category");
                var created = await _service.AddAsync(dto);
                var responseData = created;
                return CreatedAtAction(nameof(GetById), new { id = created.EmployeeCategoryId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error creating employee category");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] CreateEmployeeCategoryDTO dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "EmployeeCategory ID cannot be null or empty" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "EmployeeCategory data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Updating employee category with ID: {EmployeeCategoryId}", id);
                var existing = await _service.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("EmployeeCategory not found for update with ID: {EmployeeCategoryId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "EmployeeCategory not found" });
                }

                existing.Code = dto.Code;
                existing.Label = dto.Label;
                existing.UpdatedAt = DateTime.UtcNow;

                await _service.UpdateAsync(existing);
                var responseData = new { message = $"EmployeeCategory with ID {id} successfully updated" };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error updating employee category with ID: {EmployeeCategoryId}", id);
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
                return BadRequest(new { data = (object?)null, status = 400, message = "EmployeeCategory ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Deleting employee category with ID: {EmployeeCategoryId}", id);
                var existing = await _service.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("EmployeeCategory not found for delete with ID: {EmployeeCategoryId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "EmployeeCategory not found" });
                }

                await _service.DeleteAsync(id);
                var responseData = new { message = $"EmployeeCategory with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting employee category with ID: {EmployeeCategoryId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}