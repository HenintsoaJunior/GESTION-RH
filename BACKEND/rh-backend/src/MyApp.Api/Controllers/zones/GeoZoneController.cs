using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.zones;
using MyApp.Api.Models.dto.zones;
using MyApp.Api.Services.zones;

namespace MyApp.Api.Controllers.zones
{
    [Route("api/[controller]")]
    [ApiController]
    public class GeoZoneController : ControllerBase
    {
        private readonly IGeoZoneService _geoZoneService;
        private readonly ILogger<GeoZoneController> _logger;

        public GeoZoneController(IGeoZoneService geoZoneService, ILogger<GeoZoneController> logger)
        {
            _geoZoneService = geoZoneService ?? throw new ArgumentNullException(nameof(geoZoneService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Search([FromQuery] string? name, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var filters = new GeoZoneSearchFiltersDTO { Name = name };
            var (results, totalCount) = await _geoZoneService.SearchAsync(filters, page, pageSize);
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
                _logger.LogInformation("Retrieving all geo zones");
                var geoZones = await _geoZoneService.GetAllAsync();
                var responseData = geoZones;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving all geo zones");
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
                return BadRequest(new { data = (object?)null, status = 400, message = "GeoZone ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving geo zone with ID: {ZoneId}", id);
                var geoZone = await _geoZoneService.GetByIdAsync(id);
                if (geoZone == null)
                {
                    _logger.LogWarning("GeoZone not found for ID: {ZoneId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "GeoZone not found" });
                }
                var responseData = geoZone;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving geo zone with ID: {ZoneId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] GeoZoneDTOForm dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "GeoZone data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Creating new geo zone");
                var createdGeoZone = await _geoZoneService.AddAsync(dto);
                var responseData = new { ZoneId = createdGeoZone.ZoneId };
                return CreatedAtAction(nameof(GetById), new { id = createdGeoZone.ZoneId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error creating geo zone");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] GeoZone geoZone)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "GeoZone ID cannot be null or empty" });
            }

            if (geoZone == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "GeoZone data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            if (id != geoZone.ZoneId)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "The ID in the URL does not match the entity." });
            }

            try
            {
                _logger.LogInformation("Updating geo zone with ID: {ZoneId}", id);
                await _geoZoneService.UpdateAsync(geoZone);
                var responseData = new { message = $"GeoZone with ID {id} successfully updated", data = geoZone };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error updating geo zone with ID: {ZoneId}", id);
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
                return BadRequest(new { data = (object?)null, status = 400, message = "GeoZone ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Deleting geo zone with ID: {ZoneId}", id);
                var geoZone = await _geoZoneService.GetByIdAsync(id);
                if (geoZone == null)
                {
                    _logger.LogWarning("GeoZone not found for ID: {ZoneId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "GeoZone not found" });
                }

                await _geoZoneService.DeleteAsync(id);
                var responseData = new { message = $"GeoZone with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting geo zone with ID: {ZoneId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}