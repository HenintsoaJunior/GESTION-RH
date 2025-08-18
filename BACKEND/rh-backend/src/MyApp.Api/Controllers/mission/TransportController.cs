using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.form.transport;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransportController : ControllerBase
    {
        // Service injecté pour la gestion des transports
        private readonly ITransportService _transportService;

        public TransportController(ITransportService transportService)
        {
            _transportService = transportService;
        }

        // Récupère la liste de tous les moyens de transport
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transport>>> GetAll()
        {
            var transports = await _transportService.GetAllAsync();
            return Ok(transports);
        }

        // Récupère un moyen de transport par son identifiant
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

        // Crée un nouveau moyen de transport
        [HttpPost]
        public async Task<ActionResult<Transport>> Create([FromBody] TransportDTOForm transportDtoForm)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var transport = new Transport
            {
                Type = transportDtoForm.Type
            };

            await _transportService.CreateAsync(transport);
            return Ok(transport);
        }

        // Met à jour un moyen de transport existant
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

        // Supprime un moyen de transport par son identifiant
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