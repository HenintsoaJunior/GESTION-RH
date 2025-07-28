using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.direction;
using MyApp.Api.Services.direction;

namespace MyApp.Api.Controllers.direction
{
    [Route("api/[controller]")]
    [ApiController]
    public class UnitController : ControllerBase
    {
        private readonly IUnitService _unitService;
        private readonly ILogger<UnitController> _logger;

        public UnitController(
            IUnitService unitService,
            ILogger<UnitController> logger)
        {
            _unitService = unitService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Unit>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Récupération de toutes les unités");
                var units = await _unitService.GetAllAsync();
                return Ok(units);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des unités");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des unités.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Unit>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'une unité avec un ID null ou vide");
                    return BadRequest("L'ID de l'unité ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Récupération de l'unité avec l'ID: {UnitId}", id);
                var unit = await _unitService.GetByIdAsync(id);
                if (unit == null)
                {
                    _logger.LogWarning("Unité non trouvée pour l'ID: {UnitId}", id);
                    return NotFound();
                }

                return Ok(unit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'unité avec l'ID: {UnitId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de l'unité.");
            }
        }

        [HttpGet("service/{serviceId}")]
        public async Task<ActionResult<IEnumerable<Unit>>> GetByService(string serviceId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(serviceId))
                {
                    _logger.LogWarning("Tentative de récupération des unités avec un ID de service null ou vide");
                    return BadRequest("L'ID du service ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Récupération des unités par service: {ServiceId}", serviceId);
                var units = await _unitService.GetByServiceAsync(serviceId);
                return Ok(units);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des unités par service: {ServiceId}", serviceId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des unités par service.");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Unit>> Create([FromBody] Unit unit)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides lors de la création d'une unité: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                _logger.LogInformation("Création d'une nouvelle unité");
                await _unitService.AddAsync(unit);

                // Récupérer l'unité créée
                var createdUnit = await _unitService.GetByIdAsync(unit.UnitId);
                if (createdUnit == null)
                {
                    _logger.LogWarning("Unité non trouvée après création");
                    return StatusCode(500, "L'unité n'a pas été trouvée après création.");
                }

                _logger.LogInformation("Unité créée avec succès avec l'ID: {UnitId}", createdUnit.UnitId);
                return Ok(createdUnit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de l'unité");
                return StatusCode(500, "Une erreur est survenue lors de la création de l'unité.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Unit unit)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides lors de la mise à jour d'une unité: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour d'une unité avec un ID null ou vide");
                    return BadRequest("L'ID de l'unité ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Vérification de l'existence de l'unité avec l'ID: {UnitId}", id);
                var existingUnit = await _unitService.GetByIdAsync(id);
                if (existingUnit == null)
                {
                    _logger.LogWarning("Unité non trouvée pour l'ID: {UnitId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Mise à jour de l'unité avec l'ID: {UnitId}", id);
                await _unitService.UpdateAsync(id, unit);

                _logger.LogInformation("Unité mise à jour avec succès pour l'ID: {UnitId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'unité avec l'ID: {UnitId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de l'unité.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de suppression d'une unité avec un ID null ou vide");
                    return BadRequest("L'ID de l'unité ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Vérification de l'existence de l'unité avec l'ID: {UnitId}", id);
                var unit = await _unitService.GetByIdAsync(id);
                if (unit == null)
                {
                    _logger.LogWarning("Unité non trouvée pour l'ID: {UnitId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Suppression de l'unité avec l'ID: {UnitId}", id);
                await _unitService.DeleteAsync(id);

                _logger.LogInformation("Unité supprimée avec succès pour l'ID: {UnitId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'unité avec l'ID: {UnitId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de l'unité.");
            }
        }
    }
}