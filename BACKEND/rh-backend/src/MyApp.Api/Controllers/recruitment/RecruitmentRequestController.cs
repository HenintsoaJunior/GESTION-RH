using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.dto.recruitment;
using MyApp.Api.Services.recruitment;

namespace MyApp.Api.Controllers.recruitment
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecruitmentRequestController(
        IRecruitmentRequestService service,
        IRecruitmentRequestDetailService serviceDetails,
        ILogger<RecruitmentRequestController> logger)
        : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecruitmentRequestDetail>>> GetAll()
        {
            try
            {
                logger.LogInformation("Récupération de toutes les demandes de recrutement");
                var result = await serviceDetails.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de toutes les demandes de recrutement");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des demandes de recrutement.");
            }
        }

        [HttpGet("stats")]
        public async Task<ActionResult<RecruitmentRequestStats>> GetStatistics()
        {
            try
            {
                logger.LogInformation("Récupération des statistiques des demandes de recrutement");
                var stats = await serviceDetails.GetStatisticsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des statistiques des demandes de recrutement");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des statistiques des demandes de recrutement.");
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<(IEnumerable<RecruitmentRequestDetail>, int)>> Search(
            [FromQuery] RecruitmentRequestSearchFiltersDTO filters,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 5)
        {
            try
            {
                logger.LogInformation("Recherche des demandes de recrutement avec filtres");

                if (!string.IsNullOrWhiteSpace(filters.RequestDateMin?.ToString()) && !DateTime.TryParse(filters.RequestDateMin.ToString(), out _))
                {
                    logger.LogWarning("Format de date invalide pour RequestDateMin");
                    return BadRequest("Format de date invalide pour RequestDateMin.");
                }
                if (!string.IsNullOrWhiteSpace(filters.RequestDateMax?.ToString()) && !DateTime.TryParse(filters.RequestDateMax.ToString(), out _))
                {
                    logger.LogWarning("Format de date invalide pour RequestDateMax");
                    return BadRequest("Format de date invalide pour RequestDateMax.");
                }

                var (results, totalCount) = await serviceDetails.SearchAsync(filters, page, pageSize);
                return Ok(new { Results = results, TotalCount = totalCount });
            }
            catch (FormatException ex)
            {
                logger.LogWarning(ex, "Format de date invalide dans les paramètres de recherche");
                return BadRequest("Format de date invalide.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la recherche des demandes de recrutement");
                return StatusCode(500, "Une erreur est survenue lors de la recherche des demandes de recrutement.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RecruitmentRequest>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de récupération d'une demande de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la demande de recrutement ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération de la demande de recrutement avec l'ID: {RecruitmentRequestId}", id);
                var request = await service.GetByRequestIdAsync(id);
                if (request != null) return Ok(request);
                logger.LogWarning("Demande de recrutement non trouvée pour l'ID: {RecruitmentRequestId}", id);
                return NotFound();

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de la demande de recrutement avec l'ID: {RecruitmentRequestId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de la demande de recrutement.");
            }
        }

        [HttpGet("detail/{recruitmentRequestId}")]
        public async Task<ActionResult<RecruitmentRequestDetail>> GetDetailByRequestId(string recruitmentRequestId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(recruitmentRequestId))
                {
                    logger.LogWarning("Tentative de récupération du détail d'une demande de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la demande de recrutement ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération du détail de la demande de recrutement avec l'ID: {RecruitmentRequestId}", recruitmentRequestId);
                var detail = await serviceDetails.GetSingleByRequestIdAsync(recruitmentRequestId);
                if (detail != null) return Ok(detail);
                logger.LogWarning("Détail de demande de recrutement non trouvé pour l'ID: {RecruitmentRequestId}", recruitmentRequestId);
                return NotFound();

            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du détail de la demande de recrutement avec l'ID: {RecruitmentRequestId}", recruitmentRequestId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du détail de la demande de recrutement.");
            }
        }

        [HttpGet("requester/{requesterId}")]
        public async Task<ActionResult<IEnumerable<RecruitmentRequest>>> GetByRequesterId(string requesterId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(requesterId))
                {
                    logger.LogWarning("Tentative de récupération des demandes de recrutement avec un ID de demandeur null ou vide");
                    return BadRequest("L'ID du demandeur ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération des demandes de recrutement pour le demandeur: {RequesterId}", requesterId);
                var result = await service.GetByRequesterIdAsync(requesterId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des demandes de recrutement pour le demandeur: {RequesterId}", requesterId);
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
                    logger.LogWarning("Tentative de récupération des demandes de recrutement validées avec un ID de demandeur null ou vide");
                    return BadRequest("L'ID du demandeur ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération des demandes de recrutement validées pour le demandeur: {RequesterId}", requesterId);
                var result = await service.GetByRequesterIdAndValidatedAsync(requesterId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des demandes de recrutement validées pour le demandeur: {RequesterId}", requesterId);
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
                    logger.LogWarning("Données invalides lors de la création d'une demande de recrutement: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                var request = new RecruitmentRequest(requestForm);
                var details = new RecruitmentRequestDetail(requestForm);
                var requestReplacementReasons = RecruitmentRequestReplacementReason.FromForm(requestForm);

                logger.LogInformation("Création d'une nouvelle demande de recrutement pour le poste: {PositionTitle}", request.PositionTitle);

                var requestId = await service.CreateRequest(request, details, requestReplacementReasons);

                logger.LogInformation("Demande de recrutement créée avec succès avec l'ID: {RecruitmentRequestId}", requestId);

                return CreatedAtAction(nameof(GetById), new { id = requestId }, new { Id = requestId, Message = "Demande de recrutement créée avec succès" });
            }
            catch (ArgumentNullException ex)
            {
                logger.LogError(ex, "Argument null lors de la création de la demande de recrutement");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création de la demande de recrutement pour le poste: {PositionTitle}", requestForm.PositionTitle);
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
                    logger.LogWarning("L'ID dans l'URL ({Id}) ne correspond pas à l'ID de la demande de recrutement ({RecruitmentRequestId})", id, updatedRequest.RecruitmentRequestId);
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'ID de la demande de recrutement.");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de mise à jour d'une demande de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la demande de recrutement ne peut pas être null ou vide.");
                }

                logger.LogInformation("Mise à jour de la demande de recrutement avec l'ID: {RecruitmentRequestId}", id);
                await service.UpdateAsync(updatedRequest);

                logger.LogInformation("Demande de recrutement mise à jour avec succès pour l'ID: {RecruitmentRequestId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour de la demande de recrutement avec l'ID: {RecruitmentRequestId}", id);
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
                    logger.LogWarning("Tentative de suppression d'une demande de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la demande de recrutement ne peut pas être null ou vide.");
                }

                logger.LogInformation("Suppression de la demande de recrutement avec l'ID: {RecruitmentRequestId}", id);
                await service.DeleteAsync(id);

                logger.LogInformation("Demande de recrutement supprimée avec succès pour l'ID: {RecruitmentRequestId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression de la demande de recrutement avec l'ID: {RecruitmentRequestId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de la demande de recrutement.");
            }
        }
    }
}