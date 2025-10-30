using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.direction;
using MyApp.Api.Services.direction;
using MyApp.Api.Models.dto.direction;

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
            _unitService = unitService ?? throw new ArgumentNullException(nameof(unitService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("search")]
        public async Task<ActionResult<object>> Search([FromQuery] string? name, [FromQuery] string? serviceId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var filters = new UnitSearchFiltersDTO { Name = name, ServiceId = serviceId };
            var (results, totalCount) = await _unitService.SearchAsync(filters, page, pageSize);
            return Ok(new
            {
                data = results,
                totalCount,
                page,
                pageSize
            });
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
        public async Task<ActionResult<Unit>> Create([FromBody] UnitDTOForm form)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides lors de la création d'une unité: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                _logger.LogInformation("Création d'une nouvelle unité: {UnitName}", form.UnitName);
                var unit = await _unitService.AddAsync(form);

                _logger.LogInformation("Unité créée avec succès avec l'ID: {UnitId}", unit.UnitId);
                return CreatedAtAction(nameof(GetById), new { id = unit.UnitId }, unit);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de l'unité: {UnitName}", form?.UnitName);
                return StatusCode(500, "Une erreur est survenue lors de la création de l'unité.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Unit unit)
        {
            try
            {
                if (id != unit.UnitId)
                {
                    _logger.LogWarning("L'ID dans l'URL ({Id}) ne correspond pas à l'ID de l'unité ({UnitId})", id, unit.UnitId);
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'ID de l'unité.");
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
                await _unitService.UpdateAsync(unit);

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