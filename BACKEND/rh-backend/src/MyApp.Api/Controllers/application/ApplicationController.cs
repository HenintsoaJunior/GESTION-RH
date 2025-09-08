using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.application;
using MyApp.Api.Models.dto.application;
using MyApp.Api.Services.application;

namespace MyApp.Api.Controllers.application
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationController(
        IApplicationService applicationService,
        IApplicationCommentService applicationCommentService,
        ILogger<ApplicationController> logger)
        : ControllerBase
    {
        [HttpGet("application-comment")]
        public async Task<ActionResult<IEnumerable<ApplicationComment>>> GetAllComments()
        {
            try
            {
                var comments = await applicationCommentService.GetAllAsync();
                return Ok(comments);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de tous les commentaires");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des commentaires");
            }
        }

        [HttpGet("application-comment/{id}")]
        public async Task<ActionResult<ApplicationComment>> GetCommentById(string id)
        {
            try
            {
                var comment = await applicationCommentService.GetByIdAsync(id);
                if (comment != null) return Ok(comment);
                logger.LogWarning("Commentaire avec ID {CommentId} non trouvé", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du commentaire avec ID {CommentId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du commentaire");
            }
        }

        [HttpGet("application-comment/by-application/{applicationId}")]
        public async Task<ActionResult<IEnumerable<ApplicationComment>>> GetByApplicationId(string applicationId)
        {
            try
            {
                var comments = await applicationCommentService.GetByApplicationIdAsync(applicationId);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des commentaires pour l'application ID {ApplicationId}", applicationId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des commentaires");
            }
        }

        [HttpPost("application-comment")]
        public async Task<ActionResult<string>> Create([FromBody] ApplicationCommentDTOForm dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var id = await applicationCommentService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetCommentById), new { id }, id);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création d'un commentaire");
                return StatusCode(500, "Une erreur est survenue lors de la création du commentaire");
            }
        }

        [HttpPut("application-comment/{id}")]
        public async Task<ActionResult<ApplicationComment>> UpdateComment(string id, [FromBody] ApplicationCommentDTOForm dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updated = await applicationCommentService.UpdateAsync(id, dto);
                if (updated != null) return Ok(updated);
                logger.LogWarning("Échec mise à jour : commentaire {CommentId} introuvable", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour du commentaire avec ID {CommentId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du commentaire");
            }
        }

        [HttpDelete("application-comment/{id}")]
        public async Task<ActionResult> DeleteComment(string id)
        {
            try
            {
                var success = await applicationCommentService.DeleteAsync(id);
                if (success) return NoContent();
                logger.LogWarning("Échec suppression : commentaire {CommentId} introuvable", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression du commentaire avec ID {CommentId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du commentaire");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Application>>> GetAll()
        {
            try
            {
                var applications = await applicationService.GetAllAsync();
                return Ok(applications);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de toutes les applications");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des applications");
            }
        }

        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<Application>>> GetAllByCriteria([FromBody] ApplicationDTOForm criteria)
        {
            try
            {
                var results = await applicationService.GetAllByCriteriaAsync(criteria);
                return Ok(results);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la recherche des applications par critères");
                return StatusCode(500, "Une erreur est survenue lors de la recherche des applications");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Application>> GetById(string id)
        {
            try
            {
                var application = await applicationService.GetByIdAsync(id);
                if (application != null) return Ok(application);
                logger.LogWarning("Application avec ID {ApplicationId} non trouvée", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de l'application avec ID {ApplicationId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de l'application");
            }
        }

        [HttpPost]
        public async Task<ActionResult<string>> Create([FromBody] ApplicationDTOForm dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var id = await applicationService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id }, id);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création d'une application");
                return StatusCode(500, "Une erreur est survenue lors de la création de l'application");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Application>> Update(string id, [FromBody] ApplicationDTOForm dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedEntity = await applicationService.UpdateAsync(id, dto);
                if (updatedEntity != null) return Ok(updatedEntity);
                logger.LogWarning("Échec de la mise à jour, application avec ID {ApplicationId} introuvable", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour de l'application avec ID {ApplicationId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de l'application");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                var success = await applicationService.DeleteAsync(id);
                if (success) return NoContent();
                logger.LogWarning("Échec de suppression, application avec ID {ApplicationId} introuvable", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression de l'application avec ID {ApplicationId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de l'application");
            }
        }
    }
}