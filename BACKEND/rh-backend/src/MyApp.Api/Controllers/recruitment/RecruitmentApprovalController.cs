using Microsoft.AspNetCore.Mvc;
<<<<<<< HEAD
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Services.recruitment;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MyApp.Api.Models.form.recruitment;
=======
using MyApp.Api.Services.recruitment;
using MyApp.Api.Entities.recruitment;
using Microsoft.Extensions.Logging;
>>>>>>> origin/dev

namespace MyApp.Api.Controllers.recruitment
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecruitmentApprovalController : ControllerBase
    {
<<<<<<< HEAD
        private readonly IRecruitmentApprovalService _recruitmentApprovalService;

        public RecruitmentApprovalController(IRecruitmentApprovalService recruitmentApprovalService)
        {
            _recruitmentApprovalService = recruitmentApprovalService ?? throw new ArgumentNullException(nameof(recruitmentApprovalService));
        }

        [HttpGet("by-request/{recruitmentRequestId}")]
        public async Task<ActionResult<List<RecruitmentApproval>>> GetByRecruitmentRequestIdAsync(string recruitmentRequestId)
        {
            if (string.IsNullOrEmpty(recruitmentRequestId))
            {
                return BadRequest("Recruitment request ID is required.");
            }

            try
            {
                var approvals = await _recruitmentApprovalService.GetByRecruitmentRequestIdAsync(recruitmentRequestId);
                if (approvals == null || !approvals.Any())
                {
                    return NotFound($"No approvals found for recruitment request ID {recruitmentRequestId}.");
                }

                return Ok(approvals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving approvals: {ex.Message}");
            }
        }

        [HttpGet("{requestId}/{approverId}/{flowId}")]
        public async Task<ActionResult<RecruitmentApproval>> GetAsync(string requestId, string approverId, int flowId)
        {
            if (string.IsNullOrEmpty(requestId) || string.IsNullOrEmpty(approverId))
            {
                return BadRequest("Request ID and Approver ID are required.");
            }

            try
            {
                var approval = await _recruitmentApprovalService.GetAsync(requestId, approverId, flowId);
                if (approval == null)
                {
                    return NotFound($"Approval not found for request ID {requestId}, approver ID {approverId}, and flow ID {flowId}.");
                }

                return Ok(approval);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving approval: {ex.Message}");
            }
        }

        [HttpGet("by-approver/{approverId}")]
        public async Task<ActionResult<List<RecruitmentApproval>>> GetByApproverIdAsync(string approverId)
        {
            if (string.IsNullOrEmpty(approverId))
            {
                return BadRequest("Approver ID is required.");
            }

            try
            {
                var approvals = await _recruitmentApprovalService.GetByApproverIdAsync(approverId);
                if (approvals == null || !approvals.Any())
                {
                    return NotFound($"No approvals found for approver ID {approverId}.");
                }

                return Ok(approvals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving approvals: {ex.Message}");
            }
        }

        [HttpGet("by-status/{status}/approver/{approverId}")]
        public async Task<ActionResult<List<RecruitmentApproval>>> GetByStatusAndApproverIdAsync(string status, string approverId)
        {
            if (string.IsNullOrEmpty(status) || string.IsNullOrEmpty(approverId))
            {
                return BadRequest("Status and Approver ID are required.");
            }

            try
            {
                var approvals = await _recruitmentApprovalService.GetByStatusAndApproverIdAsync(status, approverId);
                if (approvals == null || !approvals.Any())
                {
                    return NotFound($"No approvals found for status {status} and approver ID {approverId}.");
                }

                return Ok(approvals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving approvals: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult> AddAsync([FromBody] RecruitmentApproval approval)
        {
            if (approval == null || string.IsNullOrEmpty(approval.RecruitmentRequestId) || string.IsNullOrEmpty(approval.ApproverId))
            {
                return BadRequest("Approval data, RecruitmentRequestId, and ApproverId are required.");
            }

            try
            {
                await _recruitmentApprovalService.AddAsync(approval);
                return CreatedAtAction(nameof(GetAsync), new
                {
                    requestId = approval.RecruitmentRequestId,
                    approverId = approval.ApproverId,
                    flowId = approval.ApprovalOrder ?? 0
                }, approval);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while adding approval: {ex.Message}");
            }
        }

        [HttpPost("with-flows")]
        public async Task<ActionResult> AddWithFlowsAsync([FromBody] AddWithFlowsRequestDTO request)
        {
            if (request == null || request.Approval == null || request.ApprovalFlows == null || !request.ApprovalFlows.Any())
            {
                return BadRequest("Approval data and at least one approval flow are required.");
            }

            try
            {
                await _recruitmentApprovalService.AddAsync(request.Approval, request.ApprovalFlows);
                return CreatedAtAction(nameof(GetAsync), new
                {
                    requestId = request.Approval.RecruitmentRequestId,
                    approverId = request.Approval.ApproverId,
                    flowId = request.Approval.ApprovalOrder ?? 0
                }, request.Approval);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while adding approval with flows: {ex.Message}");
            }
        }

        [HttpPut]
        public async Task<ActionResult> UpdateAsync([FromBody] RecruitmentApproval approval)
        {
            if (approval == null || string.IsNullOrEmpty(approval.RecruitmentRequestId) || string.IsNullOrEmpty(approval.ApproverId))
            {
                return BadRequest("Approval data, RecruitmentRequestId, and ApproverId are required.");
            }

            try
            {
                await _recruitmentApprovalService.UpdateAsync(approval);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while updating approval: {ex.Message}");
            }
        }
    }
}
=======
        private readonly IRecruitmentApprovalService _service;
        private readonly ILogger<RecruitmentApprovalController> _logger;

        public RecruitmentApprovalController(IRecruitmentApprovalService service, ILogger<RecruitmentApprovalController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost("validate")]
        public async Task<IActionResult> Validate([FromQuery] string requestId, [FromQuery] string approverId)
        {
            try
            {
                await _service.ValidateAsync(requestId, approverId);
                _logger.LogInformation("Demande validée par l'approbateur {ApproverId}", approverId);
                return Ok("Demande validée avec succès");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la validation de la demande");
                return StatusCode(500, "Erreur lors de la validation");
            }
        }

        [HttpPost("recommend")]
        public async Task<IActionResult> Recommend([FromQuery] string requestId, [FromQuery] string approverId, [FromQuery] string comment)
        {
            try
            {
                await _service.RecommendAsync(requestId, approverId, comment);
                _logger.LogInformation("Recommandation ajoutée pour la demande {RequestId}", requestId);
                return Ok("Recommandation enregistrée avec succès");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recommandation");
                return StatusCode(500, "Erreur lors de la recommandation");
            }
        }

        [HttpGet("byApprover/{approverId}")]
        public async Task<IActionResult> GetByApprover(string approverId)
        {
            var approvals = await _service.GetByApproverIdAsync(approverId);
            return Ok(approvals);
        }

        [HttpGet("byStatus")]
        public async Task<IActionResult> GetByStatusAndApprover([FromQuery] string status, [FromQuery] string approverId)
        {
            var approvals = await _service.GetByStatusAndApproverIdAsync(status, approverId);
            return Ok(approvals);
        }

        [HttpGet("detail")]
        public async Task<IActionResult> GetDetail([FromQuery] string requestId, [FromQuery] string approverId, [FromQuery] string flowId)
        {
            var approval = await _service.GetAsync(requestId, approverId, flowId);
            if (approval == null)
                return NotFound("Approbation non trouvée");

            return Ok(approval);
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] RecruitmentApproval approval)
        {
            try
            {
                await _service.UpdateAsync(approval);
                return Ok("Approbation mise à jour avec succès");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour");
                return StatusCode(500, "Erreur lors de la mise à jour");
            }
        }
    }
}
>>>>>>> origin/dev
