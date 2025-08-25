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
            var comments = await applicationCommentService.GetAllAsync();
            return Ok(comments);
        } 

        // GET: api/applicationcomments/{id}
        [HttpGet("application-comment/{id}")]
        public async Task<ActionResult<ApplicationComment>> GetCommentById(string id)
        {
            var comment = await applicationCommentService.GetByIdAsync(id);
            if (comment != null) return Ok(comment);
            logger.LogWarning("Commentaire avec ID {CommentId} non trouvé", id);
            return NotFound();
        }

        // GET: api/applicationcomments/by-application/{applicationId}
        [HttpGet("application-comment/by-application/{applicationId}")]
        public async Task<ActionResult<IEnumerable<ApplicationComment>>> GetByApplicationId(string applicationId)
        {
            var comments = await applicationCommentService.GetByApplicationIdAsync(applicationId);
            return Ok(comments);
        }

        // POST: api/applicationcomments
        [HttpPost ("application-comment")]
        public async Task<ActionResult<string>> Create([FromBody] ApplicationCommentDTOForm dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var id = await applicationCommentService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }

        // PUT: api/applicationcomments/{id}
        [HttpPut("application-comment/{id}")]
        public async Task<ActionResult<ApplicationComment>> UpdateComment(string id, [FromBody] ApplicationCommentDTOForm dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await applicationCommentService.UpdateAsync(id, dto);
            if (updated != null) return Ok(updated);
            logger.LogWarning("Échec mise à jour : commentaire {CommentId} introuvable", id);
            return NotFound();

        }

        // DELETE: api/applicationcomments/{id}
        [HttpDelete("application-comment/{id}")]
        public async Task<ActionResult> DeleteComment(string id)
        {
            var success = await applicationCommentService.DeleteAsync(id);
            if (success) return NoContent();
            logger.LogWarning("Échec suppression : commentaire {CommentId} introuvable", id);
            return NotFound();

        }
        
        // GET: api/applications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Application>>> GetAll()
        {
            var applications = await applicationService.GetAllAsync();
            return Ok(applications);
        }

        // POST: api/applications/search
        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<Application>>> GetAllByCriteria([FromBody] ApplicationDTOForm criteria)
        {
            var results = await applicationService.GetAllByCriteriaAsync(criteria);
            return Ok(results);
        }

        // GET: api/applications/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Application>> GetById(string id)
        {
            var application = await applicationService.GetByIdAsync(id);
            if (application != null) return Ok(application);
            logger.LogWarning("Application avec ID {ApplicationId} non trouvée", id);
            return NotFound();
        }

        // POST: api/applications
        [HttpPost]
        public async Task<ActionResult<string>> Create([FromBody] ApplicationDTOForm dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var id = await applicationService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }

        // PUT: api/applications/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<Application>> Update(string id, [FromBody] ApplicationDTOForm dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedEntity = await applicationService.UpdateAsync(id, dto);
            if (updatedEntity != null) return Ok(updatedEntity);
            logger.LogWarning("Échec de la mise à jour, application avec ID {ApplicationId} introuvable", id);
            return NotFound();

        }

        // DELETE: api/applications/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var success = await applicationService.DeleteAsync(id);
            if (success) return NoContent();
            logger.LogWarning("Échec de suppression, application avec ID {ApplicationId} introuvable", id);
            return NotFound();

        }
    }
}
