using iText.Kernel.Colors;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.form.recruitment;
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
        public async Task<IActionResult> Create([FromBody] RecruitmentRequestDTOForm requestForm, IEnumerable<ApprovalFlow> approvalFlows)
        {
            var request = new RecruitmentRequest
            {
                PositionTitle = requestForm.PositionTitle,
                PositionCount = requestForm.PositionCount,
                ContractDuration = requestForm.ContractDuration,
                FormerEmployeeName = requestForm.FormerEmployeeName,
                ReplacementDate = requestForm.ReplacementDate,
                NewPositionExplanation = requestForm.NewPositionExplanation,
                DesiredStartDate = requestForm.DesiredStartDate,
                CreatedAt = requestForm.CreatedAt,
                UpdatedAt = requestForm.UpdatedAt ?? DateTime.UtcNow,
                Status = requestForm.Status,
                Files = requestForm.Files,
                RequesterId = requestForm.RequesterId,
                ContractTypeId = requestForm.ContractTypeId,
                SiteId = requestForm.SiteId,
                RecruitmentReasonId = requestForm.RecruitmentReasonId,

                RecruitmentRequestDetail = new RecruitmentRequestDetail
                {
                    SupervisorPosition = requestForm.RecruitmentRequestDetail.SupervisorPosition,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    DirectionId = requestForm.RecruitmentRequestDetail.DirectionId,
                    DepartmentId = requestForm.RecruitmentRequestDetail.DepartmentId,
                    ServiceId = requestForm.RecruitmentRequestDetail.ServiceId,
                    DirectSupervisorId = requestForm.RecruitmentRequestDetail.DirectSupervisorId,
                },

                RecruitmentApproval = new RecruitmentApproval
                {
                    ApproverId = requestForm.RecruitmentApproval.ApproverId,
                    ApprovalFlowId = requestForm.RecruitmentApproval.ApprovalFlowId,
                    Status = requestForm.RecruitmentApproval.Status,
                    ApprovalOrder = requestForm.RecruitmentApproval.ApprovalOrder,
                    ApprovalDate = requestForm.RecruitmentApproval.ApprovalDate,
                    Comment = requestForm.RecruitmentApproval.Comment,
                    Signature = requestForm.RecruitmentApproval.Signature,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },

                ReplacementReasons = requestForm.ReplacementReasons?.Select(rr => new RecruitmentRequestReplacementReason
                {
                    ReplacementReasonId = rr.ReplacementReasonId,
                    Description = rr.Description
                }),
            };

            await _service.CreateRequest(request, approvalFlows);
            return CreatedAtAction(nameof(GetById), new { id = request.RecruitmentRequestId }, request);
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
