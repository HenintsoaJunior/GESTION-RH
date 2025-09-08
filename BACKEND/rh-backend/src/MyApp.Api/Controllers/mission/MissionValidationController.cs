using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class MissionValidationController(
        IMissionValidationService missionValidationService,
        IConfiguration configuration,
        ILogger<MissionValidationController> logger,
        IMissionAssignationService missionAssignationService)
        : ControllerBase
    {
        private readonly IMissionValidationService _missionValidationService = missionValidationService ?? throw new ArgumentNullException(nameof(missionValidationService));
        private readonly IMissionAssignationService _missionAssignationService = missionAssignationService ?? throw new ArgumentNullException(nameof(missionAssignationService));
        private readonly IConfiguration _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        private readonly ILogger<MissionValidationController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        
        //prendre l'évolution de ma demande
        // GET: api/MissionValidation/assignation/{assignationId}
        [HttpGet("by-assignation-id/{assignationId}")]
        public async Task<IActionResult> GetByAssignationId(string assignationId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(assignationId))
                {
                    _logger.LogWarning("Tentative de récupération avec un assignationId null ou vide");
                    return BadRequest(new { message = "L'assignationId ne peut pas être null ou vide." });
                }

                _logger.LogInformation("Récupération de la validation de mission pour assignationId={AssignationId}", assignationId);
                var entity = await _missionValidationService.GetByAssignationIdAsync(assignationId);

                if (entity != null) return Ok(entity);

                _logger.LogWarning("Validation de mission non trouvée pour assignationId={AssignationId}", assignationId);
                return NotFound(new { message = $"Validation de mission pour assignationId {assignationId} non trouvée." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la validation de mission avec assignationId={AssignationId}", assignationId);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la récupération de la validation." });
            }
        }

        
        [HttpPost("requests/{userId}")]
        public async Task<IActionResult> GetRequests(string userId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var (results, totalCount) = await _missionValidationService.GetRequestAsync(userId, page, pageSize);
                
                return Ok(new { Results = results, TotalCount = totalCount });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des demandes de validation de mission pour userId: {userId}", userId);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la récupération des demandes." });
            }
        }

        // POST: api/MissionValidation/validate/{missionValidationId}/{missionAssignationId}
        [HttpPost("validate/{missionValidationId}/{missionAssignationId}")]
        public async Task<IActionResult> Validate(string missionValidationId, string missionAssignationId, [FromQuery] string userId)
        {
            try
            {
                _logger.LogInformation("Validation de missionValidationId={MissionValidationId}, missionAssignationId={MissionAssignationId}", missionValidationId, missionAssignationId);
                var result = await _missionValidationService.ValidateAsync(missionValidationId, missionAssignationId, userId);
                if (!result) return Ok(new { message = "Validation effectuée avec succès." });
                var missionAssignation = await _missionAssignationService.GetByAssignationIdAsync(missionAssignationId);
                if (missionAssignation == null) return Ok(new { message = "Aucune validation à faire." });
                missionAssignation.IsValidated = 1;
                //changer le isValidated de ce mission assignation en 1
                await _missionAssignationService.UpdateAsync(missionAssignationId, missionAssignation);
                return Ok(new { message = "La mission a été validée" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la validation de missionValidationId={MissionValidationId}, missionAssignationId={MissionAssignationId}", missionValidationId, missionAssignationId);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la validation." });
            }
        }

        // GET: api/MissionValidation/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération avec un ID null ou vide");
                    return BadRequest(new { message = "L'ID ne peut pas être null ou vide." });
                }

                _logger.LogInformation("Récupération de la validation de mission avec l'ID: {MissionValidationId}", id);
                var entity = await _missionValidationService.GetByIdAsync(id);
                if (entity != null) return Ok(entity);
                _logger.LogWarning("Validation de mission avec l'ID {MissionValidationId} non trouvée", id);
                return NotFound(new { message = $"Validation avec ID {id} non trouvée." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de la validation de mission avec l'ID: {MissionValidationId}", id);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la récupération de la validation." });
            }
        }

        // GET: api/MissionValidation
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les validations de mission");
                var result = await _missionValidationService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de toutes les validations de mission");
                return StatusCode(500, new { message = "Une erreur est survenue lors de la récupération des validations." });
            }
        }

        // POST: api/MissionValidation
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MissionValidationDTOForm? dto, [FromQuery] string userId)
        {
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("Tentative de création avec un DTO null");
                    return BadRequest(new { message = "Les données de validation sont requises." });
                }

                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Tentative de création avec un userId null ou vide");
                    return BadRequest(new { message = "L'ID de l'utilisateur est requis." });
                }

                _logger.LogInformation("Création d'une validation de mission pour userId={UserId}", userId);
                var id = await _missionValidationService.CreateAsync(dto, userId);
                return CreatedAtAction(nameof(GetById), new { id }, new { MissionValidationId = id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de la validation de mission pour userId={UserId}", userId);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la création de la validation." });
            }
        }

        // PUT: api/MissionValidation/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] MissionValidationDTOForm? dto, [FromQuery] string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour avec un ID null ou vide");
                    return BadRequest(new { message = "L'ID ne peut pas être null ou vide." });
                }

                if (dto == null)
                {
                    _logger.LogWarning("Tentative de mise à jour avec un DTO null pour l'ID: {MissionValidationId}", id);
                    return BadRequest(new { message = "Les données de validation sont requises." });
                }

                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Tentative de mise à jour avec un userId null ou vide pour l'ID: {MissionValidationId}", id);
                    return BadRequest(new { message = "L'ID de l'utilisateur est requis." });
                }

                _logger.LogInformation("Mise à jour de la validation de mission avec l'ID: {MissionValidationId}, userId={UserId}", id, userId);
                var updated = await _missionValidationService.UpdateAsync(id, dto, userId);
                if (!updated)
                {
                    _logger.LogWarning("Validation de mission avec l'ID {MissionValidationId} non trouvée", id);
                    return NotFound(new { message = $"Validation avec ID {id} non trouvée." });
                }
                return Ok(new { message = "Mise à jour effectuée avec succès." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de la validation de mission avec l'ID: {MissionValidationId}", id);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la mise à jour de la validation." });
            }
        }

        // DELETE: api/MissionValidation/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, [FromQuery] string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de suppression avec un ID null ou vide");
                    return BadRequest(new { message = "L'ID ne peut pas être null ou vide." });
                }

                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Tentative de suppression avec un userId null ou vide pour l'ID: {MissionValidationId}", id);
                    return BadRequest(new { message = "L'ID de l'utilisateur est requis." });
                }

                _logger.LogInformation("Suppression de la validation de mission avec l'ID: {MissionValidationId}, userId={UserId}", id, userId);
                var deleted = await _missionValidationService.DeleteAsync(id, userId);
                if (deleted) return Ok(new { message = "Suppression effectuée avec succès." });
                _logger.LogWarning("Validation de mission avec l'ID {MissionValidationId} non trouvée", id);
                return NotFound(new { message = $"Validation avec ID {id} non trouvée." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de la validation de mission avec l'ID: {MissionValidationId}", id);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la suppression de la validation." });
            }
        }

        // PATCH: api/MissionValidation/{id}/status
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromQuery] string status, [FromQuery] string userId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour du statut avec un ID null ou vide");
                    return BadRequest(new { message = "L'ID ne peut pas être null ou vide." });
                }

                if (string.IsNullOrWhiteSpace(status))
                {
                    _logger.LogWarning("Tentative de mise à jour du statut avec un statut null ou vide pour l'ID: {MissionValidationId}", id);
                    return BadRequest(new { message = "Le statut est requis." });
                }

                if (string.IsNullOrWhiteSpace(userId))
                {
                    _logger.LogWarning("Tentative de mise à jour du statut avec un userId null ou vide pour l'ID: {MissionValidationId}", id);
                    return BadRequest(new { message = "L'ID de l'utilisateur est requis." });
                }

                _logger.LogInformation("Mise à jour du statut de la validation de mission avec l'ID: {MissionValidationId} à {Status}, userId={UserId}", id, status, userId);
                var updated = await _missionValidationService.UpdateStatusAsync(id, status, userId);
                if (updated) return Ok(new { message = $"Statut mis à jour à {status}." });
                _logger.LogWarning("Validation de mission avec l'ID {MissionValidationId} non trouvée", id);
                return NotFound(new { message = $"Validation avec ID {id} non trouvée." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du statut de la validation de mission avec l'ID: {MissionValidationId}", id);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la mise à jour du statut." });
            }
        }

        // GET: api/MissionValidation/verify/{missionId}
        [HttpGet("verify/{missionId}")]
        public async Task<IActionResult> Verify(string missionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(missionId))
                {
                    _logger.LogWarning("Tentative de vérification avec un missionId null ou vide");
                    return BadRequest(new { message = "L'ID de la mission ne peut pas être null ou vide." });
                }

                _logger.LogInformation("Vérification de la validation de mission pour missionId={MissionId}", missionId);
                var entity = await _missionValidationService.VerifyMissionValidationByMissionIdAsync(missionId);
                if (entity != null) return Ok(entity);
                _logger.LogWarning("Aucune validation trouvée pour missionId={MissionId}", missionId);
                return NotFound(new { message = "Aucune validation trouvée." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification de la validation de mission pour missionId={MissionId}", missionId);
                return StatusCode(500, new { message = "Une erreur est survenue lors de la vérification de la validation." });
            }
        }

        // POST: api/MissionValidation/search
        [HttpPost("search")]
        public async Task<IActionResult> Search([FromBody] MissionValidationSearchFiltersDTO? filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                if (filters == null)
                {
                    _logger.LogWarning("Tentative de recherche avec des filtres null");
                    return BadRequest(new { message = "Les filtres de recherche sont requis." });
                }

                if (page < 1 || pageSize < 1)
                {
                    _logger.LogWarning("Paramètres de pagination invalides: page={Page}, pageSize={PageSize}", page, pageSize);
                    return BadRequest(new { message = "Les paramètres de pagination doivent être supérieurs à 0." });
                }

                _logger.LogInformation("Recherche des validations de mission avec page={Page}, pageSize={PageSize}", page, pageSize);
                var (results, total) = await _missionValidationService.SearchAsync(filters, page, pageSize);
                return Ok(new { total, results });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche des validations de mission");
                return StatusCode(500, new { message = "Une erreur est survenue lors de la recherche des validations." });
            }
        }
    }
}