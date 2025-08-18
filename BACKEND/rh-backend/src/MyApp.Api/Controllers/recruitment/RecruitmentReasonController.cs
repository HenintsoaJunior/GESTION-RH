using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Services.recruitment;
using System;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.recruitment
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecruitmentReasonController : ControllerBase
    {
        private readonly IRecruitmentReasonService _reasonService;
        private readonly ILogger<RecruitmentReasonController> _logger;

        public RecruitmentReasonController(
            IRecruitmentReasonService reasonService,
            ILogger<RecruitmentReasonController> logger)
        {
            _reasonService = reasonService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<RecruitmentReason>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les raisons de recrutement");
                var reasons = await _reasonService.GetAllAsync();
                return Ok(reasons);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les raisons de recrutement");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des raisons de recrutement.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RecruitmentReason>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'une raison de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la raison de recrutement ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Récupération de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                var reason = await _reasonService.GetByIdAsync(id);
                if (reason == null)
                {
                    _logger.LogWarning("Raison de recrutement non trouvée pour l'ID: {RecruitmentReasonId}", id);
                    return NotFound();
                }

                return Ok(reason);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de la raison de recrutement.");
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] RecruitmentReason reason)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides lors de la création d'une raison de recrutement: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                _logger.LogInformation("Création d'une nouvelle raison de recrutement");
                await _reasonService.AddAsync(reason);

                _logger.LogInformation("Raison de recrutement créée avec succès avec l'ID: {RecruitmentReasonId}", reason.RecruitmentReasonId);
                return CreatedAtAction(nameof(GetById), new { id = reason.RecruitmentReasonId }, reason);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la raison de recrutement avec l'ID: {RecruitmentReasonId}", reason?.RecruitmentReasonId);
                return StatusCode(500, "Une erreur est survenue lors de la création de la raison de recrutement.");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] RecruitmentReason reason)
        {
            try
            {
                if (id != reason.RecruitmentReasonId)
                {
                    _logger.LogWarning("L'ID dans l'URL ({Id}) ne correspond pas à l'ID de la raison de recrutement ({RecruitmentReasonId})", id, reason.RecruitmentReasonId);
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'ID de la raison de recrutement.");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour d'une raison de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la raison de recrutement ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Vérification de l'existence de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                var existing = await _reasonService.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Raison de recrutement non trouvée pour l'ID: {RecruitmentReasonId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Mise à jour de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                await _reasonService.UpdateAsync(reason);

                _logger.LogInformation("Raison de recrutement mise à jour avec succès pour l'ID: {RecruitmentReasonId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de la raison de recrutement.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de suppression d'une raison de recrutement avec un ID null ou vide");
                    return BadRequest("L'ID de la raison de recrutement ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Vérification de l'existence de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                var reason = await _reasonService.GetByIdAsync(id);
                if (reason == null)
                {
                    _logger.LogWarning("Raison de recrutement non trouvée pour l'ID: {RecruitmentReasonId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Suppression de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                await _reasonService.DeleteAsync(id);

                _logger.LogInformation("Raison de recrutement supprimée avec succès pour l'ID: {RecruitmentReasonId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la raison de recrutement avec l'ID: {RecruitmentReasonId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de la raison de recrutement.");
            }
        }
    }
}