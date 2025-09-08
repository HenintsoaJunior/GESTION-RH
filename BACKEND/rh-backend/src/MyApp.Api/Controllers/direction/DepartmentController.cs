using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.dto.direction;
using MyApp.Api.Services.direction;

namespace MyApp.Api.Controllers.direction
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController(
        IDepartmentService departmentService,
        ILogger<DepartmentController> logger)
        : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetAll()
        {
            try
            {
                logger.LogInformation("Récupération de tous les départements");
                var departments = await departmentService.GetAllAsync();
                return Ok(departments);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de tous les départements");
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
                    logger.LogWarning("Tentative de récupération d'un département avec un ID null ou vide");
                    return BadRequest("L'ID du département ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération du département avec l'ID: {DepartmentId}", id);
                var department = await departmentService.GetByIdAsync(id);
                if (department == null)
                {
                    logger.LogWarning("Département non trouvé pour l'ID: {DepartmentId}", id);
                    return NotFound();
                }

                return Ok(department);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du département avec l'ID: {DepartmentId}", id);
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
                    logger.LogWarning("Données invalides lors de l'ajout d'un département: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                var department = new Department
                {
                    DepartmentName = form.DepartmentName,
                    DirectionId = form.DirectionId
                };

                logger.LogInformation("Ajout d'un nouveau département: {DepartmentName}", department.DepartmentName);
                await departmentService.AddAsync(department);

                logger.LogInformation("Département créé avec succès avec l'ID: {DepartmentId}", department.DepartmentId);
                return CreatedAtAction(nameof(GetById), new { id = department.DepartmentId }, department);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de l'ajout du département: {DepartmentName}", form?.DepartmentName);
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
                    logger.LogWarning("L'ID dans l'URL ({Id}) ne correspond pas à l'ID du département ({DepartmentId})", id, department.DepartmentId);
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'ID du département.");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de mise à jour d'un département avec un ID null ou vide");
                    return BadRequest("L'ID du département ne peut pas être null ou vide.");
                }

                logger.LogInformation("Vérification de l'existence du département avec l'ID: {DepartmentId}", id);
                var existingDepartment = await departmentService.GetByIdAsync(id);
                if (existingDepartment == null)
                {
                    logger.LogWarning("Département non trouvé pour l'ID: {DepartmentId}", id);
                    return NotFound();
                }

                logger.LogInformation("Mise à jour du département avec l'ID: {DepartmentId}", id);
                await departmentService.UpdateAsync(department);

                logger.LogInformation("Département mis à jour avec succès pour l'ID: {DepartmentId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour du département avec l'ID: {DepartmentId}", id);
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
                    logger.LogWarning("Tentative de suppression d'un département avec un ID null ou vide");
                    return BadRequest("L'ID du département ne peut pas être null ou vide.");
                }

                logger.LogInformation("Vérification de l'existence du département avec l'ID: {DepartmentId}", id);
                var department = await departmentService.GetByIdAsync(id);
                if (department == null)
                {
                    logger.LogWarning("Département non trouvé pour l'ID: {DepartmentId}", id);
                    return NotFound();
                }

                logger.LogInformation("Suppression du département avec l'ID: {DepartmentId}", id);
                await departmentService.DeleteAsync(id);

                logger.LogInformation("Département supprimé avec succès pour l'ID: {DepartmentId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression du département avec l'ID: {DepartmentId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du département.");
            }
        }
    }
}