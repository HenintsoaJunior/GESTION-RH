using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransportController : ControllerBase
    {
        private readonly ITransportService _transportService;

        public TransportController(ITransportService transportService)
        {
            _transportService = transportService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transport>>> GetAll()
        {
            var transports = await _transportService.GetAllAsync();
            return Ok(transports);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Transport>> GetById(string id)
        {
            var transport = await _transportService.GetByIdAsync(id);
            if (transport == null)
            {
                return NotFound();
            }
            return Ok(transport);
        }

        [HttpPost]
        public async Task<ActionResult<string>> Create([FromBody] Transport transport)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var transportId = await _transportService.CreateAsync(transport);
            return CreatedAtAction(nameof(GetById), new { id = transportId }, transportId);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] Transport transport)
        {
            if (!ModelState.IsValid || id != transport.TransportId)
            {
                return BadRequest();
            }

            var updated = await _transportService.UpdateAsync(transport);
            if (!updated)
            {
                return NotFound();
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var deleted = await _transportService.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}