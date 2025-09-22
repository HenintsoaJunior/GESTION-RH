using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.jobs;
using MyApp.Api.Models.dto.jobs;
using MyApp.Api.Services.jobs;

namespace MyApp.Api.Controllers.jobs
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobDescriptionController(
        IJobDescriptionService service,
        ILogger<JobDescriptionController> logger) // Added ILogger dependency
        : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var descriptions = await service.GetAllAsync();
                return Ok(descriptions);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de toutes les descriptions de poste");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des descriptions de poste");
            }
        }

        [HttpPost("search")]
        public async Task<IActionResult> GetAllByCriteria([FromBody] JobDescriptionDTO criteria)
        {
            try
            {
                var descriptions = await service.GetAllByCriteriaAsync(criteria);
                return Ok(descriptions);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la recherche des descriptions de poste par critères");
                return StatusCode(500, "Une erreur est survenue lors de la recherche des descriptions de poste");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var description = await service.GetByIdAsync(id);
                if (description == null)
                {
                    logger.LogWarning("Description de poste avec ID {JobDescriptionId} non trouvée", id);
                    return NotFound();
                }
                return Ok(description);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de la description de poste avec ID {JobDescriptionId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de la description de poste");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] JobDescriptionDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var id = await service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id }, new { id });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création d'une description de poste");
                return StatusCode(500, "Une erreur est survenue lors de la création de la description de poste");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] JobDescriptionDTO dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updated = await service.UpdateAsync(id, dto);
                if (updated == null)
                {
                    logger.LogWarning("Échec de la mise à jour, description de poste avec ID {JobDescriptionId} introuvable", id);
                    return NotFound();
                }
                return Ok(updated);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour de la description de poste avec ID {JobDescriptionId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de la description de poste");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var deleted = await service.DeleteAsync(id);
                if (!deleted)
                {
                    logger.LogWarning("Échec de suppression, description de poste avec ID {JobDescriptionId} introuvable", id);
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression de la description de poste avec ID {JobDescriptionId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de la description de poste");
            }
        }
    }
}