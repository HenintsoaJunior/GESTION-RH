using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.recruitment;
using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Controllers.recruitment
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecruitmentApprovalController : ControllerBase
    {
        private readonly IRecruitmentApprovalService _service;
        private readonly ILogger<RecruitmentApprovalController> _logger;

        public RecruitmentApprovalController(IRecruitmentApprovalService service, ILogger<RecruitmentApprovalController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost("validate")]
        public async Task<IActionResult> Validate([FromQuery] string recruitmentRequestId, [FromQuery] string approverId)
        {
            try
            {
                await _service.ValidateAsync(recruitmentRequestId, approverId);
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
        public async Task<IActionResult> Recommend([FromQuery] string recruitmentRequestId, [FromQuery] string approverId, [FromQuery] string comment)
        {
            try
            {
                await _service.RecommendAsync(recruitmentRequestId, approverId, comment);
                _logger.LogInformation("Recommandation ajoutée pour la demande {RecruitmentRequestId}", recruitmentRequestId);
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

        [HttpGet("byRecruitmentRequest/{recruitmentRequestId}")]
        public async Task<IActionResult> GetByRecruitmentRequestId(string recruitmentRequestId)
        {
            try
            {
                var approvals = await _service.GetByRecruitmentRequestIdAsync(recruitmentRequestId);
                if (!approvals.Any())
                {
                    _logger.LogInformation("Aucune approbation trouvée pour RecruitmentRequestId: {RecruitmentRequestId}", recruitmentRequestId);
                    return NotFound("Aucune approbation trouvée");
                }
                
                _logger.LogInformation("Approbations récupérées pour RecruitmentRequestId: {RecruitmentRequestId}", recruitmentRequestId);
                return Ok(approvals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des approbations pour RecruitmentRequestId: {RecruitmentRequestId}", recruitmentRequestId);
                return StatusCode(500, "Erreur lors de la récupération des approbations");
            }
        }

        [HttpGet("detail")]
        public async Task<IActionResult> GetDetail([FromQuery] string recruitmentRequestId, [FromQuery] string approverId, [FromQuery] string flowId)
        {
            var approval = await _service.GetAsync(recruitmentRequestId, approverId, flowId);
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