using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.candidates;
using YourAppNamespace.Entities;

namespace MyApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CandidatesController : ControllerBase
    {
        private readonly ICandidateService _candidateService;

        public CandidatesController(ICandidateService candidateService)
        {
            _candidateService = candidateService;
        }

        // GET: api/candidates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Candidate>>> GetAll()
        {
            var candidates = await _candidateService.GetAllAsync();
            return Ok(candidates);
        }

        // GET: api/candidates/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Candidate>> GetById(string id)
        {
            var candidate = await _candidateService.GetByIdAsync(id);
            if (candidate == null)
                return NotFound();

            return Ok(candidate);
        }

        // POST: api/candidates/search
        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<Candidate>>> Search([FromBody] Candidate criteria)
        {
            var candidates = await _candidateService.GetAllByCriteriaAsync(criteria);
            return Ok(candidates);
        }

        // POST: api/candidates
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Candidate candidate)
        {
            await _candidateService.AddAsync(candidate);
            return CreatedAtAction(nameof(GetById), new { id = candidate.CandidateId }, candidate);
        }

        // PUT: api/candidates/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] Candidate candidate)
        {
            if (id != candidate.CandidateId)
                return BadRequest("L'ID ne correspond pas.");

            var existing = await _candidateService.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            await _candidateService.UpdateAsync(candidate);
            return NoContent();
        }

        // DELETE: api/candidates/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var candidate = await _candidateService.GetByIdAsync(id);
            if (candidate == null)
                return NotFound();

            await _candidateService.DeleteAsync(candidate);
            return NoContent();
        }
    }
}
