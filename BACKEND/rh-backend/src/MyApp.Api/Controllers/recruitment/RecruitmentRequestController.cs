using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.form.recruitment;
using MyApp.Api.Services.recruitment;
using System;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.recruitment
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecruitmentRequestController : ControllerBase
    {
        private readonly IRecruitmentRequestService _service;
        private readonly ILogger<RecruitmentRequestController> _logger;

        public RecruitmentRequestController(
            IRecruitmentRequestService service,
            ILogger<RecruitmentRequestController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecruitmentRequest>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les demandes de recrutement");
                var result = await _service.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les demandes de recrutement");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des demandes de recrutement.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RecruitmentRequest>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'une demande de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la demande de recrutement ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Récupération de la demande de recrutement avec l'ID: {RecruitmentRequestId}", id);
                var request = await _service.GetByRequestIdAsync(id);
                if (request == null)
                {
                    _logger.LogWarning("Demande de recrutement non trouvée pour l'ID: {RecruitmentRequestId}", id);
                    return NotFound();
                }

                return Ok(request);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la demande de recrutement avec l'ID: {RecruitmentRequestId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de la demande de recrutement.");
            }
        }

        [HttpGet("requester/{requesterId}")]
        public async Task<ActionResult<IEnumerable<RecruitmentRequest>>> GetByRequesterId(string requesterId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requesterId))
                {
                    _logger.LogWarning("Tentative de récupération des demandes de recrutement avec un ID de demandeur null ou vide");
                    return BadRequest("L'ID du demandeur ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Récupération des demandes de recrutement pour le demandeur: {RequesterId}", requesterId);
                var result = await _service.GetByRequesterIdAsync(requesterId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des demandes de recrutement pour le demandeur: {RequesterId}", requesterId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des demandes de recrutement par demandeur.");
            }
        }

        [HttpGet("requester/{requesterId}/validated")]
        public async Task<ActionResult<IEnumerable<RecruitmentRequest>>> GetByRequesterIdAndValidated(string requesterId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requesterId))
                {
                    _logger.LogWarning("Tentative de récupération des demandes de recrutement validées avec un ID de demandeur null ou vide");
                    return BadRequest("L'ID du demandeur ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Récupération des demandes de recrutement validées pour le demandeur: {RequesterId}", requesterId);
                var result = await _service.GetByRequesterIdAndValidatedAsync(requesterId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des demandes de recrutement validées pour le demandeur: {RequesterId}", requesterId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des demandes de recrutement validées.");
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] RecruitmentRequestDTOForm requestForm)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides lors de la création d'une demande de recrutement: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                // Validation supplémentaire des données requises
                if (requestForm.RecruitmentRequestDetail == null)
                {
                    _logger.LogWarning("Détails de la demande de recrutement manquants");
                    return BadRequest("Les détails de la demande de recrutement sont requis");
                }

                var request = new RecruitmentRequest
                {
                    PositionTitle = requestForm.PositionTitle,
                    PositionCount = requestForm.PositionCount,
                    ContractDuration = requestForm.ContractDuration,
                    FormerEmployeeName = requestForm.FormerEmployeeName,
                    ReplacementDate = requestForm.ReplacementDate,
                    NewPositionExplanation = requestForm.NewPositionExplanation,
                    DesiredStartDate = requestForm.DesiredStartDate,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Status = requestForm.Status ?? "En attente",
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
                };

                _logger.LogInformation("Création d'une nouvelle demande de recrutement pour le poste: {PositionTitle}", request.PositionTitle);
                
                var requestId = await _service.CreateRequest(request);
                
                _logger.LogInformation("Demande de recrutement créée avec succès avec l'ID: {RecruitmentRequestId}", requestId);
                
                return CreatedAtAction(nameof(GetById), new { id = requestId }, new { id = requestId, message = "Demande de recrutement créée avec succès" });
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogError(ex, "Argument null lors de la création de la demande de recrutement");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la demande de recrutement pour le poste: {PositionTitle}", requestForm?.PositionTitle);
                return StatusCode(500, "Une erreur est survenue lors de la création de la demande de recrutement.");
            }
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] RecruitmentRequest updatedRequest)
        {
            try
            {
                if (id != updatedRequest.RecruitmentRequestId)
                {
                    _logger.LogWarning("L'ID dans l'URL ({Id}) ne correspond pas à l'ID de la demande de recrutement ({RecruitmentRequestId})", id, updatedRequest.RecruitmentRequestId);
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'ID de la demande de recrutement.");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour d'une demande de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la demande de recrutement ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Mise à jour de la demande de recrutement avec l'ID: {RecruitmentRequestId}", id);
                await _service.UpdateAsync(updatedRequest);

                _logger.LogInformation("Demande de recrutement mise à jour avec succès pour l'ID: {RecruitmentRequestId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la demande de recrutement avec l'ID: {RecruitmentRequestId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de la demande de recrutement.");
            }
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de suppression d'une demande de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la demande de recrutement ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Suppression de la demande de recrutement avec l'ID: {RecruitmentRequestId}", id);
                await _service.DeleteAsync(id);

                _logger.LogInformation("Demande de recrutement supprimée avec succès pour l'ID: {RecruitmentRequestId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la demande de recrutement avec l'ID: {RecruitmentRequestId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de la demande de recrutement.");
            }
        }
    }
}