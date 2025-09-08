using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.jobs;
using MyApp.Api.Models.dto.jobs;
using MyApp.Api.Services.jobs;

namespace MyApp.Api.Controllers.jobs
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobOfferController(
        IJobOfferService service,
        ILogger<JobOfferController> logger) // Added ILogger dependency
        : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var offers = await service.GetAllAsync();
                return Ok(offers);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de toutes les offres d'emploi");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des offres d'emploi");
            }
        }

        [HttpPost("search")]
        public async Task<IActionResult> GetAllByCriteria([FromBody] JobOfferDTOForm criteria)
        {
            try
            {
                var offers = await service.GetAllByCriteriaAsync(criteria);
                return Ok(offers);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la recherche des offres d'emploi par critères");
                return StatusCode(500, "Une erreur est survenue lors de la recherche des offres d'emploi");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var offer = await service.GetByIdAsync(id);
                if (offer == null)
                {
                    logger.LogWarning("Offre d'emploi avec ID {JobOfferId} non trouvée", id);
                    return NotFound();
                }
                return Ok(offer);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de l'offre d'emploi avec ID {JobOfferId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de l'offre d'emploi");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] JobOfferDTOForm dto)
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
                logger.LogError(ex, "Erreur lors de la création d'une offre d'emploi");
                return StatusCode(500, "Une erreur est survenue lors de la création de l'offre d'emploi");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] JobOfferDTOForm dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updated = await service.UpdateAsync(id, dto);
                if (updated == null)
                {
                    logger.LogWarning("Échec de la mise à jour, offre d'emploi avec ID {JobOfferId} introuvable", id);
                    return NotFound();
                }
                return Ok(updated);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour de l'offre d'emploi avec ID {JobOfferId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de l'offre d'emploi");
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
                    logger.LogWarning("Échec de suppression, offre d'emploi avec ID {JobOfferId} introuvable", id);
                    return NotFound();
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression de l'offre d'emploi avec ID {JobOfferId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de l'offre d'emploi");
            }
        }
    }
}