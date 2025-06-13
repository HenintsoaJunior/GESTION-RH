using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Services.recruitment;

namespace MyApp.Api.Controllers.recruitment
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApprovalFlowController : ControllerBase
    {
        private readonly IApprovalFlowService _service;

        public ApprovalFlowController(IApprovalFlowService service)
        {
            _service = service;
        }

        // GET: api/ApprovalFlow
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ApprovalFlow>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/ApprovalFlow/AF001
        [HttpGet("{id}")]
        public async Task<ActionResult<ApprovalFlow>> GetById(string id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // POST: api/ApprovalFlow
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ApprovalFlow approvalFlow)
        {
            await _service.AddAsync(approvalFlow);
            return CreatedAtAction(nameof(GetById), new { id = approvalFlow.ApprovalFlowId }, approvalFlow);
        }

        // PUT: api/ApprovalFlow/AF001
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ApprovalFlow approvalFlow)
        {
            if (id != approvalFlow.ApprovalFlowId)
                return BadRequest("ID mismatch");

            await _service.UpdateAsync(approvalFlow);
            return NoContent();
        }

        // DELETE: api/ApprovalFlow/AF001
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
