using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.transport;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransportController(
        ITransportService transportService,
        ILogger<TransportController> logger) // Added ILogger dependency
        : ControllerBase
    {
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
                var transports = await transportService.GetAllAsync();
                return Ok(new { data = transports, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de tous les moyens de transport");
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la récupération de tous les moyens de transport");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
//
        // Récupère un moyen de transport par son identifiant
        [HttpGet("{id}")]
        public async Task<ActionResult<Transport>> GetById(string id)
        {
            try
            {
                var transport = await transportService.GetByIdAsync(id);
                if (transport != null) return Ok(transport);
                logger.LogWarning("Moyen de transport avec ID {TransportId} non trouvé", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du moyen de transport avec ID {TransportId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du moyen de transport");
            }
        }

        // Crée un nouveau moyen de transport
        [HttpPost]
        public async Task<ActionResult<Transport>> Create([FromBody] TransportDTOForm transportDtoForm)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var transport = new Transport
                {
                    Type = transportDtoForm.Type
                };

                await transportService.CreateAsync(transport);
                return CreatedAtAction(nameof(GetById), new { id = transport.TransportId }, transport);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création d'un moyen de transport");
                return StatusCode(500, "Une erreur est survenue lors de la création du moyen de transport");
            }
        }

        // Met à jour un moyen de transport existant
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] Transport transport)
        {
            try
            {
                if (!ModelState.IsValid || id != transport.TransportId)
                {
                    return BadRequest(ModelState);
                }

                var updated = await transportService.UpdateAsync(transport);
                if (updated) return NoContent();
                logger.LogWarning("Échec de la mise à jour, moyen de transport avec ID {TransportId} introuvable", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour du moyen de transport avec ID {TransportId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du moyen de transport");
            }
        }

        // Supprime un moyen de transport par son identifiant
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                var deleted = await transportService.DeleteAsync(id);
                if (deleted) return NoContent();
                logger.LogWarning("Échec de suppression, moyen de transport avec ID {TransportId} introuvable", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression du moyen de transport avec ID {TransportId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du moyen de transport");
            }
        }
    }
}