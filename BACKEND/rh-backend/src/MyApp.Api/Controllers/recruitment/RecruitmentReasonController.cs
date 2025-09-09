using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Services.recruitment;

namespace MyApp.Api.Controllers.recruitment
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecruitmentReasonController(
        IRecruitmentReasonService reasonService,
        ILogger<RecruitmentReasonController> logger)
        : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecruitmentReason>>> GetAll()
        {
            try
            {
                logger.LogInformation("Récupération de toutes les raisons de recrutement");
                var reasons = await reasonService.GetAllAsync();
                return Ok(reasons);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de toutes les raisons de recrutement");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des raisons de recrutement.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RecruitmentReason>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de récupération d'une raison de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la raison de recrutement ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                var reason = await reasonService.GetByIdAsync(id);
                if (reason == null)
                {
                    logger.LogWarning("Raison de recrutement non trouvée pour l'ID: {RecruitmentReasonId}", id);
                    return NotFound();
                }

                return Ok(reason);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de la raison de recrutement.");
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] RecruitmentReason reason)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    logger.LogWarning("Données invalides lors de la création d'une raison de recrutement: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                logger.LogInformation("Création d'une nouvelle raison de recrutement");
                await reasonService.AddAsync(reason);

                logger.LogInformation("Raison de recrutement créée avec succès avec l'ID: {RecruitmentReasonId}", reason.RecruitmentReasonId);
                return CreatedAtAction(nameof(GetById), new { id = reason.RecruitmentReasonId }, reason);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création de la raison de recrutement avec l'ID: {RecruitmentReasonId}", reason.RecruitmentReasonId);
                return StatusCode(500, "Une erreur est survenue lors de la création de la raison de recrutement.");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] RecruitmentReason reason)
        {
            try
            {
                if (id != reason.RecruitmentReasonId)
                {
                    logger.LogWarning("L'ID dans l'URL ({Id}) ne correspond pas à l'ID de la raison de recrutement ({RecruitmentReasonId})", id, reason.RecruitmentReasonId);
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'ID de la raison de recrutement.");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de mise à jour d'une raison de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la raison de recrutement ne peut pas être null ou vide.");
                }

                logger.LogInformation("Vérification de l'existence de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                var existing = await reasonService.GetByIdAsync(id);
                if (existing == null)
                {
                    logger.LogWarning("Raison de recrutement non trouvée pour l'ID: {RecruitmentReasonId}", id);
                    return NotFound();
                }

                logger.LogInformation("Mise à jour de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                await reasonService.UpdateAsync(reason);

                logger.LogInformation("Raison de recrutement mise à jour avec succès pour l'ID: {RecruitmentReasonId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de la raison de recrutement.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de suppression d'une raison de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la raison de recrutement ne peut pas être null ou vide.");
                }

                logger.LogInformation("Vérification de l'existence de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                var reason = await reasonService.GetByIdAsync(id);
                if (reason == null)
                {
                    logger.LogWarning("Raison de recrutement non trouvée pour l'ID: {RecruitmentReasonId}", id);
                    return NotFound();
                }

                logger.LogInformation("Suppression de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                await reasonService.DeleteAsync(id);

                logger.LogInformation("Raison de recrutement supprimée avec succès pour l'ID: {RecruitmentReasonId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de la raison de recrutement.");
            }
        }
    }
}