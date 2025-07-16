using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.recruitment;
using MyApp.Api.Services.recruitment;

namespace MyApp.Api.Controllers.recruitment
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecruitmentRequestController : ControllerBase
    {
        private readonly IRecruitmentRequestService _service;

        public RecruitmentRequestController(IRecruitmentRequestService service)
        {
            _service = service;
        }

        // GET: api/RecruitmentRequest
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecruitmentRequest>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/RecruitmentRequest/id
        [HttpGet("{id}")]
        public async Task<ActionResult<RecruitmentRequest>> GetById(string id)
        {
            var request = await _service.GetByRequestIdAsync(id);
            if (request == null) return NotFound();
            return Ok(request);
        }

        // GET: api/RecruitmentRequest/requester/{requesterId}
        [HttpGet("requester/{requesterId}")]
        public async Task<ActionResult<IEnumerable<RecruitmentRequest>>> GetByRequesterId(string requesterId)
        {
            var result = await _service.GetByRequesterIdAsync(requesterId);
            return Ok(result);
        }

        // GET: api/RecruitmentRequest/requester/{requesterId}/validated
        [HttpGet("requester/{requesterId}/validated")]
        public async Task<ActionResult<IEnumerable<RecruitmentRequest>>> GetByRequesterIdAndValidated(string requesterId)
        {
            var result = await _service.GetByRequesterIdAndValidatedAsync(requesterId);
            return Ok(result);
        }

        // POST: api/RecruitmentRequest
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] RecruitmentRequestDTO request)
        {
            await _service.CreateRequest(request);
            return CreatedAtAction(nameof(GetById), new { id = request.RecruitmentRequest.RecruitmentRequestId }, request);
        }

        // PUT: api/RecruitmentRequest/{id}
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] RecruitmentRequest updatedRequest)
        {
            if (id != updatedRequest.RecruitmentRequestId)
                return BadRequest("ID mismatch");

            await _service.UpdateAsync(updatedRequest);
            return NoContent();
        }

        // DELETE: api/RecruitmentRequest/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
