using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.candidates;
using MyApp.Api.Models.form.candidates;
using MyApp.Api.Services.candidates;

namespace MyApp.Api.Controllers.candidates
{
    [ApiController]
    [Route("api/[controller]")]
    public class CandidateController(
        ICandidateService service,
        ILogger<CandidateController> logger)
        : ControllerBase
    {
        // GET: api/candidates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Candidate>>> GetAll()
        {
            var candidates = await service.GetAllAsync();
            return Ok(candidates);
        }

        // GET: api/candidates/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Candidate>> GetById(string id)
        {
            var candidate = await service.GetByIdAsync(id);
            if (candidate == null)
            {
                return NotFound(new { Message = $"Candidat avec ID {id} introuvable." });
            }
            return Ok(candidate);
        }

        // POST: api/candidates
        [HttpPost]
        public async Task<ActionResult<string>> Create([FromBody] CandidateDTOForm candidateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var newId = await service.CreateAsync(candidateDto);
                return CreatedAtAction(nameof(GetById), new { id = newId }, new { CandidateId = newId });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création d'un candidat");
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        // PUT: api/candidates/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] CandidateDTOForm candidateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var updated = await service.UpdateAsync(id, candidateDto);
                if (!updated)
                {
                    return NotFound(new { Message = $"Candidat avec ID {id} introuvable." });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour du candidat {CandidateId}", id);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        // DELETE: api/candidates/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                var deleted = await service.DeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { Message = $"Candidat avec ID {id} introuvable." });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression du candidat {CandidateId}", id);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        // GET: api/candidates/search
        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<Candidate>>> Search([FromBody] CandidateDTOForm criteria)
        {
            var candidates = await service.GetAllByCriteriaAsync(criteria);
            return Ok(candidates);
        }
    }
}
