using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.recruitment;

namespace MyApp.Api.Controllers.recruitment
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecruitmentValidationController : ControllerBase
    {
        private readonly IRecruitmentValidationService _recruitmentValidationService;
        private readonly ILogger<RecruitmentValidationController> _logger;

        public RecruitmentValidationController(
            IRecruitmentValidationService recruitmentValidationService,
            ILogger<RecruitmentValidationController> logger)
        {
            _recruitmentValidationService = recruitmentValidationService ?? throw new ArgumentNullException(nameof(recruitmentValidationService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost("validate/{recruitmentRequestId}")]
        public async Task<IActionResult> ValidateRecruitmentRequest(
            string recruitmentRequestId,
            [FromBody] Models.dto.recruitment.ValidateRequestDto request)
        {
            try
            {
                bool isCompleted = await _recruitmentValidationService
                    .ValidateRecruitmentRequestAsync(recruitmentRequestId, request.ValidatorUserId);

                var status = await _recruitmentValidationService
                    .GetRecruitmentRequestStatusAsync(recruitmentRequestId);

                return Ok(new
                {
                    Success = true,
                    IsCompleted = isCompleted,
                    Status = status,
                    Message = isCompleted
                        ? "Toutes les validations sont terminées"
                        : "Validation effectuée, en attente de la suivante"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPost("refuse/{recruitmentValidationId}")]
        public async Task<IActionResult> RefuseRecruitmentRequest(
            string recruitmentValidationId,
            [FromBody] Models.dto.recruitment.ValidateRequestDto request)
        {
            try
            {
                bool success = await _recruitmentValidationService
                    .RefuseAsync(recruitmentValidationId, request.ValidatorUserId);

                if (!success)
                {
                    return NotFound(new { Error = $"La validation avec l'ID {recruitmentValidationId} n'a pas été trouvée." });
                }

                var status = await _recruitmentValidationService
                    .GetRecruitmentRequestStatusAsync(recruitmentValidationId);

                return Ok(new
                {
                    Success = true,
                    Status = status,
                    Message = "Validation refusée avec succès."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du refus de la validation de recrutement pour recruitmentValidationId: {recruitmentValidationId}", recruitmentValidationId);
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPost("requests/{userId}")]
        public async Task<IActionResult> GetRequests(string userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var (results, totalCount) = await _recruitmentValidationService.GetRequestAsync(userId, page, pageSize);

                return Ok(new { Results = results, TotalCount = totalCount });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des demandes de validation de mission pour userId: {userId}", userId);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la récupération des demandes." });
            }
        }

        [HttpGet("by-request/{recruitmentRequestId}")]
        public async Task<IActionResult> GetByRequestId(string recruitmentRequestId)
        {
            try
            {
                var results = await _recruitmentValidationService.GetByRequestIdAsync(recruitmentRequestId);
                if (results == null || !results.Any())
                {
                    return NotFound(new { message = $"Aucune validation de recrutement trouvée pour le recruitmentRequestId: {recruitmentRequestId}" });
                }
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des validations de recrutement pour recruitmentRequestId: {recruitmentRequestId}", recruitmentRequestId);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la récupération des validations." });
            }
        }
    }
}