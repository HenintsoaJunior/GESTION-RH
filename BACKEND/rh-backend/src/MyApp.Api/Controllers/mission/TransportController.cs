using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.transport;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransportController : ControllerBase
    {
        private readonly ITransportService _transportService;
        private readonly ILogger<TransportController> _logger;

        public TransportController(ITransportService transportService, ILogger<TransportController> logger)
        {
            _transportService = transportService ?? throw new ArgumentNullException(nameof(transportService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // Récupère la liste de tous les moyens de transport
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
                _logger.LogInformation("Retrieving all transports");
                var transports = await _transportService.GetAllAsync();
                var responseData = transports;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving all transports");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // Récupère un moyen de transport par son identifiant
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Transport ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving transport with ID: {TransportId}", id);
                var transport = await _transportService.GetByIdAsync(id);
                if (transport == null)
                {
                    _logger.LogWarning("Transport not found for ID: {TransportId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Transport not found" });
                }
                var responseData = transport;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving transport with ID: {TransportId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // Crée un nouveau moyen de transport
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] TransportDTOForm transportDtoForm)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (transportDtoForm == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Transport data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Creating new transport");
                var transport = new Transport
                {
                    Type = transportDtoForm.Type
                };
                await _transportService.CreateAsync(transport);
                var responseData = new { TransportId = transport.TransportId };
                return CreatedAtAction(nameof(GetById), new { id = transport.TransportId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error creating transport");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }[HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] Transport transport)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Transport ID cannot be null or empty" });
            }

            if (transport == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Transport data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            // Fix: Set ID from URL if missing/empty in body
            if (string.IsNullOrWhiteSpace(transport.TransportId))
            {
                transport.TransportId = id;
            }
            else if (id != transport.TransportId)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "The ID in the URL does not match the entity." });
            }

            try
            {
                _logger.LogInformation("Updating transport with ID: {TransportId}", id);
                await _transportService.UpdateAsync(transport);
                var responseData = new { message = $"Transport with ID {id} successfully updated", data = transport };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error updating transport with ID: {TransportId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // Supprime un moyen de transport par son identifiant
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Transport ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Deleting transport with ID: {TransportId}", id);
                var transport = await _transportService.GetByIdAsync(id);
                if (transport == null)
                {
                    _logger.LogWarning("Transport not found for ID: {TransportId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Transport not found" });
                }

                await _transportService.DeleteAsync(id);
                var responseData = new { message = $"Transport with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting transport with ID: {TransportId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}