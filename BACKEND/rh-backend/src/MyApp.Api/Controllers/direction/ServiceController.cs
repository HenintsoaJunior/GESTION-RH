using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.dto.direction;
using MyApp.Api.Services.direction;

namespace MyApp.Api.Controllers.direction
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceService _serviceService;
        private readonly ILogger<ServiceController> _logger;

        public ServiceController(IServiceService serviceService, ILogger<ServiceController> logger)
        {
            _serviceService = serviceService ?? throw new ArgumentNullException(nameof(serviceService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Search([FromQuery] string? name, [FromQuery] string? departmentId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var filters = new ServiceSearchFiltersDTO { Name = name, DepartmentId = departmentId };
            var (results, totalCount) = await _serviceService.SearchAsync(filters, page, pageSize);
            return Ok(new
            {
                data = results,
                totalCount,
                page,
                pageSize
            });
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
                _logger.LogInformation("Retrieving all services");
                var services = await _serviceService.GetAllAsync();
                var responseData = services;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving all services");
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Service ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving service with ID: {ServiceId}", id);
                var service = await _serviceService.GetByIdAsync(id);
                if (service == null)
                {
                    _logger.LogWarning("Service not found for ID: {ServiceId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Service not found" });
                }
                var responseData = service;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving service with ID: {ServiceId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] ServiceDTOForm dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Service data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Creating new service");
                var createdService = await _serviceService.AddAsync(dto);
                var responseData = new { ServiceId = createdService.ServiceId };
                return CreatedAtAction(nameof(GetById), new { id = createdService.ServiceId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error creating service");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] Service service)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Service ID cannot be null or empty" });
            }

            if (service == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Service data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            if (id != service.ServiceId)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "The ID in the URL does not match the entity." });
            }

            try
            {
                _logger.LogInformation("Updating service with ID: {ServiceId}", id);
                var existingService = await _serviceService.GetByIdAsync(id);
                if (existingService == null)
                {
                    _logger.LogWarning("Service not found for ID: {ServiceId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Service not found" });
                }
                await _serviceService.UpdateAsync(service);
                var responseData = new { message = $"Service with ID {id} successfully updated", data = service };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error updating service with ID: {ServiceId}", id);
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Service ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Deleting service with ID: {ServiceId}", id);
                var service = await _serviceService.GetByIdAsync(id);
                if (service == null)
                {
                    _logger.LogWarning("Service not found for ID: {ServiceId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Service not found" });
                }

                await _serviceService.DeleteAsync(id);
                var responseData = new { message = $"Service with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting service with ID: {ServiceId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}