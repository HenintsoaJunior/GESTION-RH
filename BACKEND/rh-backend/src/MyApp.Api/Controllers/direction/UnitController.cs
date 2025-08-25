using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.direction;
using MyApp.Api.Services.direction;

namespace MyApp.Api.Controllers.direction
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnitController(
        IUnitService unitService,
        ILogger<UnitController> logger)
        : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Unit>>> GetAll()
        {
            try
            {
                logger.LogInformation("Récupération de toutes les unités");
                var units = await unitService.GetAllAsync();
                return Ok(units);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des unités");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des unités.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Unit>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de récupération d'une unité avec un ID null ou vide");
                    return BadRequest("L'ID de l'unité ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération de l'unité avec l'ID: {UnitId}", id);
                var unit = await unitService.GetByIdAsync(id);
                if (unit == null)
                {
                    logger.LogWarning("Unité non trouvée pour l'ID: {UnitId}", id);
                    return NotFound();
                }

                return Ok(unit);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de l'unité avec l'ID: {UnitId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de l'unité.");
            }
        }

        [HttpGet("service/{serviceId}")]
        public async Task<ActionResult<IEnumerable<Unit>>> GetByService(string serviceId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(serviceId))
                {
                    logger.LogWarning("Tentative de récupération des unités avec un ID de service null ou vide");
                    return BadRequest("L'ID du service ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération des unités par service: {ServiceId}", serviceId);
                var units = await unitService.GetByServiceAsync(serviceId);
                return Ok(units);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des unités par service: {ServiceId}", serviceId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des unités par service.");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Unit>> Create([FromBody] Unit unit)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    logger.LogWarning("Données invalides lors de la création d'une unité: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                logger.LogInformation("Création d'une nouvelle unité");
                await unitService.AddAsync(unit);

                // Récupérer l'unité créée
                var createdUnit = await unitService.GetByIdAsync(unit.UnitId);
                if (createdUnit == null)
                {
                    logger.LogWarning("Unité non trouvée après création");
                    return StatusCode(500, "L'unité n'a pas été trouvée après création.");
                }

                logger.LogInformation("Unité créée avec succès avec l'ID: {UnitId}", createdUnit.UnitId);
                return Ok(createdUnit);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création de l'unité");
                return StatusCode(500, "Une erreur est survenue lors de la création de l'unité.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Unit unit)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    logger.LogWarning("Données invalides lors de la mise à jour d'une unité: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de mise à jour d'une unité avec un ID null ou vide");
                    return BadRequest("L'ID de l'unité ne peut pas être null ou vide.");
                }

                logger.LogInformation("Vérification de l'existence de l'unité avec l'ID: {UnitId}", id);
                var existingUnit = await unitService.GetByIdAsync(id);
                if (existingUnit == null)
                {
                    logger.LogWarning("Unité non trouvée pour l'ID: {UnitId}", id);
                    return NotFound();
                }

                logger.LogInformation("Mise à jour de l'unité avec l'ID: {UnitId}", id);
                await unitService.UpdateAsync(id, unit);

                logger.LogInformation("Unité mise à jour avec succès pour l'ID: {UnitId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour de l'unité avec l'ID: {UnitId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de l'unité.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de suppression d'une unité avec un ID null ou vide");
                    return BadRequest("L'ID de l'unité ne peut pas être null ou vide.");
                }

                logger.LogInformation("Vérification de l'existence de l'unité avec l'ID: {UnitId}", id);
                var unit = await unitService.GetByIdAsync(id);
                if (unit == null)
                {
                    logger.LogWarning("Unité non trouvée pour l'ID: {UnitId}", id);
                    return NotFound();
                }

                logger.LogInformation("Suppression de l'unité avec l'ID: {UnitId}", id);
                await unitService.DeleteAsync(id);

                logger.LogInformation("Unité supprimée avec succès pour l'ID: {UnitId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression de l'unité avec l'ID: {UnitId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de l'unité.");
            }
        }
    }
}