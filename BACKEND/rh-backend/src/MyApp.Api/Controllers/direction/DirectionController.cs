using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.dto.direction;
using MyApp.Api.Services.direction;

namespace MyApp.Api.Controllers.direction
{
    [Route("api/[controller]")]
    [ApiController]
    public class DirectionController : ControllerBase
    {
        private readonly IDirectionService _directionService;
        private readonly ILogger<DirectionController> _logger;

        public DirectionController(IDirectionService directionService, ILogger<DirectionController> logger)
        {
            _directionService = directionService ?? throw new ArgumentNullException(nameof(directionService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Search([FromQuery] string? name, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var filters = new DirectionSearchFiltersDTO { Name = name };
            var (results, totalCount) = await _directionService.SearchAsync(filters, page, pageSize);
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
                _logger.LogInformation("Retrieving all directions");
                var directions = await _directionService.GetAllAsync();
                var responseData = directions;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving all directions");
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Direction ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving direction with ID: {DirectionId}", id);
                var direction = await _directionService.GetByIdAsync(id);
                if (direction == null)
                {
                    _logger.LogWarning("Direction not found for ID: {DirectionId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Direction not found" });
                }
                var responseData = direction;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving direction with ID: {DirectionId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] DirectionDTOForm dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Direction data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Creating new direction");
                var createdDirection = await _directionService.AddAsync(dto);
                var responseData = new { DirectionId = createdDirection.DirectionId };
                return CreatedAtAction(nameof(GetById), new { id = createdDirection.DirectionId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error creating direction");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] Direction direction)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Direction ID cannot be null or empty" });
            }

            if (direction == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Direction data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            if (id != direction.DirectionId)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "The ID in the URL does not match the entity." });
            }

            try
            {
                _logger.LogInformation("Updating direction with ID: {DirectionId}", id);
                await _directionService.UpdateAsync(direction);
                var responseData = new { message = $"Direction with ID {id} successfully updated", data = direction };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error updating direction with ID: {DirectionId}", id);
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Direction ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Deleting direction with ID: {DirectionId}", id);
                var direction = await _directionService.GetByIdAsync(id);
                if (direction == null)
                {
                    _logger.LogWarning("Direction not found for ID: {DirectionId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Direction not found" });
                }

                await _directionService.DeleteAsync(id);
                var responseData = new { message = $"Direction with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting direction with ID: {DirectionId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}