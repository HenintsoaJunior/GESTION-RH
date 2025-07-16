using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Services.recruitment;

namespace MyApp.Api.Controllers.recruitment
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReplacementReasonController : ControllerBase
    {
        private readonly IReplacementReasonService _reasonService;

        public ReplacementReasonController(IReplacementReasonService reasonService)
        {
            _reasonService = reasonService;
        }

        // GET: api/replacementreason
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ReplacementReason>>> GetAll()
        {
            var reasons = await _reasonService.GetAllAsync();
            return Ok(reasons);
        }

        // GET: api/replacementreason/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ReplacementReason>> GetById(string id)
        {
            var reason = await _reasonService.GetByIdAsync(id);
            if (reason == null)
                return NotFound();

            return Ok(reason);
        }

        // POST: api/replacementreason
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] ReplacementReason reason)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _reasonService.AddAsync(reason);
            return CreatedAtAction(nameof(GetById), new { id = reason.ReplacementReasonId }, reason);
        }

        // PUT: api/replacementreason/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] ReplacementReason reason)
        {
            if (id != reason.ReplacementReasonId)
                return BadRequest("L'ID dans l'URL ne correspond pas à l'entité.");

            var existing = await _reasonService.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            await _reasonService.UpdateAsync(reason);
            return NoContent();
        }

        // DELETE: api/replacementreason/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var reason = await _reasonService.GetByIdAsync(id);
            if (reason == null)
                return NotFound();

            await _reasonService.DeleteAsync(id);
            return NoContent();
        }
    }
}
