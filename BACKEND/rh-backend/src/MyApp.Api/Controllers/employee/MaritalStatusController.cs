using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.employee;
using MyApp.Api.Services.employee;

namespace MyApp.Api.Controllers.employee
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaritalStatusController : ControllerBase
    {
        private readonly IMaritalStatusService _maritalStatusService;
        private readonly ILogger<MaritalStatusController> _logger;

        public MaritalStatusController(
            IMaritalStatusService maritalStatusService,
            ILogger<MaritalStatusController> logger)
        {
            _maritalStatusService = maritalStatusService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MaritalStatus>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les statuts matrimoniaux");
                var maritalStatuses = await _maritalStatusService.GetAllAsync();
                return Ok(maritalStatuses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des statuts matrimoniaux");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des statuts matrimoniaux.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MaritalStatus>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un statut matrimonial avec un ID null ou vide");
                    return BadRequest("L'ID du statut matrimonial ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Récupération du statut matrimonial avec l'ID: {MaritalStatusId}", id);
                var maritalStatus = await _maritalStatusService.GetByIdAsync(id);
                if (maritalStatus == null)
                {
                    _logger.LogWarning("Statut matrimonial non trouvé pour l'ID: {MaritalStatusId}", id);
                    return NotFound();
                }

                return Ok(maritalStatus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du statut matrimonial avec l'ID: {MaritalStatusId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du statut matrimonial.");
            }
        }

        [HttpPost]
        public async Task<ActionResult<MaritalStatus>> Create([FromBody] MaritalStatus maritalStatus)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides lors de la création d'un statut matrimonial: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                _logger.LogInformation("Création d'un nouveau statut matrimonial");
                await _maritalStatusService.AddAsync(maritalStatus);

                // Récupérer le statut matrimonial créé
                var createdMaritalStatus = await _maritalStatusService.GetByIdAsync(maritalStatus.MaritalStatusId);
                if (createdMaritalStatus == null)
                {
                    _logger.LogWarning("Statut matrimonial non trouvé après création");
                    return StatusCode(500, "Le statut matrimonial n'a pas été trouvé après création.");
                }

                _logger.LogInformation("Statut matrimonial créé avec succès avec l'ID: {MaritalStatusId}", createdMaritalStatus.MaritalStatusId);
                return Ok(createdMaritalStatus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du statut matrimonial");
                return StatusCode(500, "Une erreur est survenue lors de la création du statut matrimonial.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] MaritalStatus maritalStatus)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides lors de la mise à jour d'un statut matrimonial: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour d'un statut matrimonial avec un ID null ou vide");
                    return BadRequest("L'ID du statut matrimonial ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Vérification de l'existence du statut matrimonial avec l'ID: {MaritalStatusId}", id);
                var existingMaritalStatus = await _maritalStatusService.GetByIdAsync(id);
                if (existingMaritalStatus == null)
                {
                    _logger.LogWarning("Statut matrimonial non trouvé pour l'ID: {MaritalStatusId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Mise à jour du statut matrimonial avec l'ID: {MaritalStatusId}", id);
                await _maritalStatusService.UpdateAsync(id, maritalStatus);

                _logger.LogInformation("Statut matrimonial mis à jour avec succès pour l'ID: {MaritalStatusId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du statut matrimonial avec l'ID: {MaritalStatusId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du statut matrimonial.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de suppression d'un statut matrimonial avec un ID null ou vide");
                    return BadRequest("L'ID du statut matrimonial ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Vérification de l'existence du statut matrimonial avec l'ID: {MaritalStatusId}", id);
                var maritalStatus = await _maritalStatusService.GetByIdAsync(id);
                if (maritalStatus == null)
                {
                    _logger.LogWarning("Statut matrimonial non trouvé pour l'ID: {MaritalStatusId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Suppression du statut matrimonial avec l'ID: {MaritalStatusId}", id);
                await _maritalStatusService.DeleteAsync(id);

                _logger.LogInformation("Statut matrimonial supprimé avec succès pour l'ID: {MaritalStatusId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du statut matrimonial avec l'ID: {MaritalStatusId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du statut matrimonial.");
            }
        }
    }
}