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
            try
            {
                var cvDetails = await cvDetailService.GetAllAsync();
                return Ok(cvDetails);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de tous les détails CV");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des détails CV");
            }
        }

        // GET: api/cvdetails/application/{applicationId}
        [HttpGet("cv-detail/application/{applicationId}")]
        public async Task<ActionResult<IEnumerable<CvDetail>>> GetByApplicationId(string applicationId)
        {
            try
            {
                var results = await cvDetailService.GetByApplicationIdAsync(applicationId);
                return Ok(results);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des détails CV pour l'application ID {ApplicationId}", applicationId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des détails CV");
            }
        }

        // GET: api/cvdetails/{id}
        [HttpGet("cv-detail/{id}")]
        public async Task<ActionResult<CvDetail>> GetCvDetailById(string id)
        {
            try
            {
                var cvDetail = await cvDetailService.GetByIdAsync(id);
                if (cvDetail != null) return Ok(cvDetail);
                logger.LogWarning("CV detail avec ID {CvDetailId} non trouvé", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du détail CV avec ID {CvDetailId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du détail CV");
            }
        }

        // POST: api/cvdetails
        [HttpPost("cv-detail")]
        public async Task<ActionResult<string>> CreateCvDetail([FromBody] CvDetailDTOForm dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var id = await cvDetailService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetCvDetailById), new { id }, id);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création d'un détail CV");
                return StatusCode(500, "Une erreur est survenue lors de la création du détail CV");
            }
        }

        // PUT: api/cvdetails/{id}
        [HttpPut("cv-detail/{id}")]
        public async Task<ActionResult<CvDetail>> UpdateCvDetail(string id, [FromBody] CvDetailDTOForm dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var updatedEntity = await cvDetailService.UpdateAsync(id, dto);
                if (updatedEntity != null) return Ok(updatedEntity);
                logger.LogWarning("Échec de la mise à jour, CV detail avec ID {CvDetailId} introuvable", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour du détail CV avec ID {CvDetailId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du détail CV");
            }
        }

        // DELETE: api/cvdetails/{id}
        [HttpDelete("cv-detail/{id}")]
        public async Task<ActionResult> DeleteCvDetail(string id)
        {
            try
            {
                var success = await cvDetailService.DeleteAsync(id);
                if (success) return NoContent();
                logger.LogWarning("Échec de suppression, CV detail avec ID {CvDetailId} introuvable", id);
                return NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression du détail CV avec ID {CvDetailId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du détail CV");
            }
        }

        // GET: api/candidates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Candidate>>> GetAll()
        {
            try
            {
                var candidates = await candidateService.GetAllAsync();
                return Ok(candidates);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de tous les candidats");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des candidats");
            }
        }

        // GET: api/candidates/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Candidate>> GetById(string id)
        {
            try
            {
                var candidate = await candidateService.GetByIdAsync(id);
                if (candidate == null)
                {
                    logger.LogWarning("Candidat avec ID {CandidateId} introuvable", id);
                    return NotFound(new { Message = $"Candidat avec ID {id} introuvable." });
                }
                return Ok(candidate);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du candidat avec ID {CandidateId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du candidat");
            }
        }

        // POST: api/candidates
        [HttpPost]
        public async Task<ActionResult<string>> Create([FromBody] CandidateDTOForm candidateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var newId = await candidateService.CreateAsync(candidateDto);
                return CreatedAtAction(nameof(GetById), new { id = newId }, new { CandidateId = newId });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création d'un candidat");
                return StatusCode(500, "Une erreur est survenue lors de la création du candidat");
            }
        }

        // PUT: api/candidates/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] CandidateDTOForm candidateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updated = await candidateService.UpdateAsync(id, candidateDto);
                if (!updated)
                {
                    logger.LogWarning("Échec de la mise à jour, candidat avec ID {CandidateId} introuvable", id);
                    return NotFound(new { Message = $"Candidat avec ID {id} introuvable." });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour du candidat avec ID {CandidateId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du candidat");
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
                    logger.LogWarning("Échec de suppression, candidat avec ID {CandidateId} introuvable", id);
                    return NotFound(new { Message = $"Candidat avec ID {id} introuvable." });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression du candidat avec ID {CandidateId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du candidat");
            }
        }

        // GET: api/candidates/search
        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<Candidate>>> Search([FromBody] CandidateDTOForm criteria)
        {
            try
            {
                var candidates = await candidateService.GetAllByCriteriaAsync(criteria);
                return Ok(candidates);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la recherche des candidats par critères");
                return StatusCode(500, "Une erreur est survenue lors de la recherche des candidats");
            }
        }
    }
}