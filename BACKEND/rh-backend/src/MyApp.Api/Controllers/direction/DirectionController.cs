using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.form.direction;
using MyApp.Api.Services.direction;
using System;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.direction
{
    [Route("api/[controller]")]
    [ApiController]
    public class DirectionController(
        IDirectionService directionService,
        ILogger<DirectionController> logger)
        : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Direction>>> GetAll()
        {
            try
            {
                logger.LogInformation("Récupération de toutes les directions");
                var directions = await directionService.GetAllAsync();
                return Ok(directions);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de toutes les directions");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des directions.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Direction>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de récupération d'une direction avec un ID null ou vide");
                    return BadRequest("L'ID de la direction ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération de la direction avec l'ID: {DirectionId}", id);
                var direction = await directionService.GetByIdAsync(id);
                if (direction == null)
                {
                    logger.LogWarning("Direction non trouvée pour l'ID: {DirectionId}", id);
                    return NotFound();
                }

                return Ok(direction);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de la direction avec l'ID: {DirectionId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de la direction.");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Direction>> Add([FromBody] DirectionDTOForm form)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    logger.LogWarning("Données invalides lors de l'ajout d'une direction: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                var direction = new Direction
                {
                    DirectionName = form.DirectionName,
                    Acronym = form.Acronym
                };

                logger.LogInformation("Ajout d'une nouvelle direction: {DirectionName}", direction.DirectionName);
                await directionService.AddAsync(direction);

                logger.LogInformation("Direction créée avec succès avec l'ID: {DirectionId}", direction.DirectionId);
                return CreatedAtAction(nameof(GetById), new { id = direction.DirectionId }, direction);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de l'ajout de la direction: {DirectionName}", form?.DirectionName);
                return StatusCode(500, "Une erreur est survenue lors de l'ajout de la direction.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Direction direction)
        {
            try
            {
                if (id != direction.DirectionId)
                {
                    logger.LogWarning("L'ID dans l'URL ({Id}) ne correspond pas à l'ID de la direction ({DirectionId})", id, direction.DirectionId);
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'ID de la direction.");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de mise à jour d'une direction avec un ID null ou vide");
                    return BadRequest("L'ID de la direction ne peut pas être null ou vide.");
                }

                logger.LogInformation("Vérification de l'existence de la direction avec l'ID: {DirectionId}", id);
                var existingDirection = await directionService.GetByIdAsync(id);
                if (existingDirection == null)
                {
                    logger.LogWarning("Direction non trouvée pour l'ID: {DirectionId}", id);
                    return NotFound();
                }

                logger.LogInformation("Mise à jour de la direction avec l'ID: {DirectionId}", id);
                await directionService.UpdateAsync(direction);

                logger.LogInformation("Direction mise à jour avec succès pour l'ID: {DirectionId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour de la direction avec l'ID: {DirectionId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de la direction.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de suppression d'une direction avec un ID null ou vide");
                    return BadRequest("L'ID de la direction ne peut pas être null ou vide.");
                }

                logger.LogInformation("Vérification de l'existence de la direction avec l'ID: {DirectionId}", id);
                var direction = await directionService.GetByIdAsync(id);
                if (direction == null)
                {
                    logger.LogWarning("Direction non trouvée pour l'ID: {DirectionId}", id);
                    return NotFound();
                }

                logger.LogInformation("Suppression de la direction avec l'ID: {DirectionId}", id);
                await directionService.DeleteAsync(id);

                logger.LogInformation("Direction supprimée avec succès pour l'ID: {DirectionId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression de la direction avec l'ID: {DirectionId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de la direction.");
            }
        }
    }
}