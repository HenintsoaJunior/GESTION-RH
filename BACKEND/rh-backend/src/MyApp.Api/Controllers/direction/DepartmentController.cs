using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.form.direction;
using MyApp.Api.Services.direction;

namespace MyApp.Api.Controllers.direction
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;
        private readonly ILogger<DepartmentController> _logger;

        public DepartmentController(
            IDepartmentService departmentService,
            ILogger<DepartmentController> logger)
        {
            _departmentService = departmentService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les départements");
                var departments = await _departmentService.GetAllAsync();
                return Ok(departments);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les départements");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des départements.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Department>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de récupération d'un département avec un ID null ou vide");
                    return BadRequest("L'ID du département ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Récupération du département avec l'ID: {DepartmentId}", id);
                var department = await _departmentService.GetByIdAsync(id);
                if (department == null)
                {
                    _logger.LogWarning("Département non trouvé pour l'ID: {DepartmentId}", id);
                    return NotFound();
                }

                return Ok(department);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du département avec l'ID: {DepartmentId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du département.");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Department>> Add([FromBody] DepartmentDTOForm form)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides lors de l'ajout d'un département: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                var department = new Department
                {
                    DepartmentName = form.DepartmentName,
                    DirectionId = form.DirectionId
                };

                _logger.LogInformation("Ajout d'un nouveau département: {DepartmentName}", department.DepartmentName);
                await _departmentService.AddAsync(department);

                _logger.LogInformation("Département créé avec succès avec l'ID: {DepartmentId}", department.DepartmentId);
                return CreatedAtAction(nameof(GetById), new { id = department.DepartmentId }, department);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'ajout du département: {DepartmentName}", form?.DepartmentName);
                return StatusCode(500, "Une erreur est survenue lors de l'ajout du département.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Department department)
        {
            try
            {
                if (id != department.DepartmentId)
                {
                    _logger.LogWarning("L'ID dans l'URL ({Id}) ne correspond pas à l'ID du département ({DepartmentId})", id, department.DepartmentId);
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'ID du département.");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour d'un département avec un ID null ou vide");
                    return BadRequest("L'ID du département ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Vérification de l'existence du département avec l'ID: {DepartmentId}", id);
                var existingDepartment = await _departmentService.GetByIdAsync(id);
                if (existingDepartment == null)
                {
                    _logger.LogWarning("Département non trouvé pour l'ID: {DepartmentId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Mise à jour du département avec l'ID: {DepartmentId}", id);
                await _departmentService.UpdateAsync(department);

                _logger.LogInformation("Département mis à jour avec succès pour l'ID: {DepartmentId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du département avec l'ID: {DepartmentId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du département.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de suppression d'un département avec un ID null ou vide");
                    return BadRequest("L'ID du département ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Vérification de l'existence du département avec l'ID: {DepartmentId}", id);
                var department = await _departmentService.GetByIdAsync(id);
                if (department == null)
                {
                    _logger.LogWarning("Département non trouvé pour l'ID: {DepartmentId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Suppression du département avec l'ID: {DepartmentId}", id);
                await _departmentService.DeleteAsync(id);

                _logger.LogInformation("Département supprimé avec succès pour l'ID: {DepartmentId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du département avec l'ID: {DepartmentId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du département.");
            }
        }
    }
}