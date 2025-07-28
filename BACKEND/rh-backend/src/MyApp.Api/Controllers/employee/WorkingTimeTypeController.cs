using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.employee;
using MyApp.Api.Services.employee;

namespace MyApp.Api.Controllers.employee
{
    [Route("api/[controller]")]
    [ApiController]
    public class WorkingTimeTypeController : ControllerBase
    {
        private readonly IWorkingTimeTypeService _workingTimeTypeService;
        private readonly ILogger<WorkingTimeTypeController> _logger;

        public WorkingTimeTypeController(
            IWorkingTimeTypeService workingTimeTypeService,
            ILogger<WorkingTimeTypeController> logger)
        {
            _workingTimeTypeService = workingTimeTypeService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<WorkingTimeType>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les types de temps de travail");
                var workingTimeTypes = await _workingTimeTypeService.GetAllAsync();
                return Ok(workingTimeTypes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des types de temps de travail");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des types de temps de travail.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<WorkingTimeType>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un type de temps de travail avec un ID null ou vide");
                    return BadRequest("L'ID du type de temps de travail ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Récupération du type de temps de travail avec l'ID: {WorkingTimeTypeId}", id);
                var workingTimeType = await _workingTimeTypeService.GetByIdAsync(id);
                if (workingTimeType == null)
                {
                    _logger.LogWarning("Type de temps de travail non trouvé pour l'ID: {WorkingTimeTypeId}", id);
                    return NotFound();
                }

                return Ok(workingTimeType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du type de temps de travail avec l'ID: {WorkingTimeTypeId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du type de temps de travail.");
            }
        }

        [HttpPost]
        public async Task<ActionResult<WorkingTimeType>> Create([FromBody] WorkingTimeType workingTimeType)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides lors de la création d'un type de temps de travail: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                _logger.LogInformation("Création d'un nouveau type de temps de travail");
                await _workingTimeTypeService.AddAsync(workingTimeType);

                // Récupérer le type de temps de travail créé
                var createdWorkingTimeType = await _workingTimeTypeService.GetByIdAsync(workingTimeType.WorkingTimeTypeId);
                if (createdWorkingTimeType == null)
                {
                    _logger.LogWarning("Type de temps de travail non trouvé après création");
                    return StatusCode(500, "Le type de temps de travail n'a pas été trouvé après création.");
                }

                _logger.LogInformation("Type de temps de travail créé avec succès avec l'ID: {WorkingTimeTypeId}", createdWorkingTimeType.WorkingTimeTypeId);
                return Ok(createdWorkingTimeType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du type de temps de travail");
                return StatusCode(500, "Une erreur est survenue lors de la création du type de temps de travail.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] WorkingTimeType workingTimeType)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides lors de la mise à jour d'un type de temps de travail: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour d'un type de temps de travail avec un ID null ou vide");
                    return BadRequest("L'ID du type de temps de travail ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Vérification de l'existence du type de temps de travail avec l'ID: {WorkingTimeTypeId}", id);
                var existingWorkingTimeType = await _workingTimeTypeService.GetByIdAsync(id);
                if (existingWorkingTimeType == null)
                {
                    _logger.LogWarning("Type de temps de travail non trouvé pour l'ID: {WorkingTimeTypeId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Mise à jour du type de temps de travail avec l'ID: {WorkingTimeTypeId}", id);
                await _workingTimeTypeService.UpdateAsync(id, workingTimeType);

                _logger.LogInformation("Type de temps de travail mis à jour avec succès pour l'ID: {WorkingTimeTypeId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du type de temps de travail avec l'ID: {WorkingTimeTypeId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du type de temps de travail.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de suppression d'un type de temps de travail avec un ID null ou vide");
                    return BadRequest("L'ID du type de temps de travail ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Vérification de l'existence du type de temps de travail avec l'ID: {WorkingTimeTypeId}", id);
                var workingTimeType = await _workingTimeTypeService.GetByIdAsync(id);
                if (workingTimeType == null)
                {
                    _logger.LogWarning("Type de temps de travail non trouvé pour l'ID: {WorkingTimeTypeId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Suppression du type de temps de travail avec l'ID: {WorkingTimeTypeId}", id);
                await _workingTimeTypeService.DeleteAsync(id);

                _logger.LogInformation("Type de temps de travail supprimé avec succès pour l'ID: {WorkingTimeTypeId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du type de temps de travail avec l'ID: {WorkingTimeTypeId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du type de temps de travail.");
            }
        }
    }
}