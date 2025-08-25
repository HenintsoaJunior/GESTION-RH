using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.candidates;
using MyApp.Api.Models.dto.candidates;
using MyApp.Api.Services.candidates;

namespace MyApp.Api.Controllers.candidates
{
    [ApiController]
    [Route("api/[controller]")]
    public class CandidateController(
        ICandidateService candidateService,
        ICvDetailService cvDetailService,
        ILogger<CandidateController> logger)
        : ControllerBase
    {
        
        // GET: api/cvdetails
        [HttpGet("cv-detail")]
        public async Task<ActionResult<IEnumerable<CvDetail>>> GetAllCvDetail()
        {
            var cvDetails = await cvDetailService.GetAllAsync();
            return Ok(cvDetails);
        }

        // GET: api/cvdetails/application/{applicationId}
        [HttpGet("cv-detail/application/{applicationId}")]
        public async Task<ActionResult<IEnumerable<CvDetail>>> GetByApplicationId(string applicationId)
        {
            var results = await cvDetailService.GetByApplicationIdAsync(applicationId);
            return Ok(results);
        }

        // GET: api/cvdetails/{id}
        [HttpGet("cv-detail/{id}")]
        public async Task<ActionResult<CvDetail>> GetCvDetailById(string id)
        {
            var cvDetail = await cvDetailService.GetByIdAsync(id);
            if (cvDetail != null) return Ok(cvDetail);
            logger.LogWarning("CV detail avec ID {CvDetailId} non trouvé", id);
            return NotFound();
        }

        // POST: api/cvdetails
        [HttpPost ("cv-detail")]
        public async Task<ActionResult<string>> CreateCvDetail([FromBody] CvDetailDTOForm dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var id = await cvDetailService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }

        // PUT: api/cvdetails/{id}
        [HttpPut("cv-detail/{id}")]
        public async Task<ActionResult<CvDetail>> UpdateCvDetail(string id, [FromBody] CvDetailDTOForm dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedEntity = await cvDetailService.UpdateAsync(id, dto);
            if (updatedEntity != null) return Ok(updatedEntity);
            logger.LogWarning("Échec de la mise à jour, CV detail avec ID {CvDetailId} introuvable", id);
            return NotFound();

        }

        // DELETE: api/cvdetails/{id}
        [HttpDelete("cv-detail/{id}")]
        public async Task<ActionResult> DeleteCvDetail(string id)
        {
            var success = await cvDetailService.DeleteAsync(id);
            if (success) return NoContent();
            logger.LogWarning("Échec de suppression, CV detail avec ID {CvDetailId} introuvable", id);
            return NotFound();

        }
        
        // GET: api/candidates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Candidate>>> GetAll()
        {
            var candidates = await candidateService.GetAllAsync();
            return Ok(candidates);
        }

        // GET: api/candidates/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Candidate>> GetById(string id)
        {
            var candidate = await candidateService.GetByIdAsync(id);
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
                var newId = await candidateService.CreateAsync(candidateDto);
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
                var updated = await candidateService.UpdateAsync(id, candidateDto);
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
                var deleted = await candidateService.DeleteAsync(id);
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
            var candidates = await candidateService.GetAllByCriteriaAsync(criteria);
            return Ok(candidates);
        }
    }
}
