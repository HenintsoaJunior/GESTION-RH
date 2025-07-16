using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Services.recruitment;

namespace MyApp.Api.Controllers.recruitment
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecruitmentReasonController : ControllerBase
    {
        private readonly IRecruitmentReasonService _reasonService;

        public RecruitmentReasonController(IRecruitmentReasonService reasonService)
        {
            _reasonService = reasonService;
        }

        // GET: api/recruitmentreason
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecruitmentReason>>> GetAll()
        {
            var reasons = await _reasonService.GetAllAsync();
            return Ok(reasons);
        }

        // GET: api/recruitmentreason/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RecruitmentReason>> GetById(string id)
        {
            var reason = await _reasonService.GetByIdAsync(id);
            if (reason == null)
                return NotFound();

            return Ok(reason);
        }

        // POST: api/recruitmentreason
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] RecruitmentReason reason)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _reasonService.AddAsync(reason);
            return CreatedAtAction(nameof(GetById), new { id = reason.RecruitmentReasonId }, reason);
        }

        // PUT: api/recruitmentreason/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] RecruitmentReason reason)
        {
            if (id != reason.RecruitmentReasonId)
                return BadRequest("L'ID dans l'URL ne correspond pas à l'entité.");

            var existing = await _reasonService.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            await _reasonService.UpdateAsync(reason);
            return NoContent();
        }

        // DELETE: api/recruitmentreason/{id}
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
