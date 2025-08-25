using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.form.employee;
using MyApp.Api.Models.search.employee;
using MyApp.Api.Services.employee;


namespace MyApp.Api.Controllers.employee
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController(
        IEmployeeService employeeService,
        ILogger<EmployeeController> logger)
        : ControllerBase
    {
        [HttpPost("search")]
        public async Task<ActionResult<object>> Search([FromBody] EmployeeSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                logger.LogInformation("Recherche paginée des employés avec filtres, page: {Page}, pageSize: {PageSize}", page, pageSize);
                var (results, totalCount) = await employeeService.SearchAsync(filters, page, pageSize);
                return Ok(new
                {
                    data = results,
                    totalCount,
                    page,
                    pageSize
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la recherche paginée des employés");
                return StatusCode(500, "Une erreur est survenue lors de la recherche des employés.");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetAll()
        {
            try
            {
                logger.LogInformation("Récupération de tous les employés");
                var employees = await employeeService.GetAllAsync();
                return Ok(employees);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de tous les employés");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des employés.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de récupération d'un employé avec un ID null ou vide");
                    return BadRequest("L'ID de l'employé ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération de l'employé avec l'ID: {EmployeeId}", id);
                var employee = await employeeService.GetByIdAsync(id);
                if (employee == null)
                {
                    logger.LogWarning("Employé non trouvé pour l'ID: {EmployeeId}", id);
                    return NotFound();
                }

                return Ok(employee);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de l'employé avec l'ID: {EmployeeId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de l'employé.");
            }
        }

        [HttpGet("gender/{genderId}")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetByGender(string genderId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(genderId))
                {
                    logger.LogWarning("Tentative de récupération des employés avec un ID de genre null ou vide");
                    return BadRequest("L'ID du genre ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération des employés par genre: {GenderId}", genderId);
                var employees = await employeeService.GetByGenderAsync(genderId);
                return Ok(employees);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des employés par genre: {GenderId}", genderId);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des employés par genre.");
            }
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetByStatus(string status)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(status))
                {
                    logger.LogWarning("Tentative de récupération des employés avec un statut null ou vide");
                    return BadRequest("Le statut ne peut pas être null ou vide.");
                }

                logger.LogInformation("Récupération des employés par statut: {Status}", status);
                var employees = await employeeService.GetByStatusAsync(status);
                return Ok(employees);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des employés par statut: {Status}", status);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des employés par statut.");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Employee>> Create([FromBody] EmployeeFormDTO employeeForm)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    logger.LogWarning("Données invalides lors de la création d'un employé: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                logger.LogInformation("Création d'un nouvel employé");
                await employeeService.AddAsync(employeeForm);

                // Récupérer l'employé créé (l'ID est généré dans le service)
                var employee = await employeeService.GetAllAsync();
                var createdEmployee = employee.OrderByDescending(e => e.EmployeeId).FirstOrDefault();
                if (createdEmployee == null)
                {
                    logger.LogWarning("Employé non trouvé après création");
                    return StatusCode(500, "L'employé n'a pas été trouvé après création.");
                }

                logger.LogInformation("Employé créé avec succès avec l'ID: {EmployeeId}", createdEmployee.EmployeeId);
                return Ok(createdEmployee);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création de l'employé");
                return StatusCode(500, "Une erreur est survenue lors de la création de l'employé.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] EmployeeFormDTO employeeForm)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    logger.LogWarning("Données invalides lors de la mise à jour d'un employé: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de mise à jour d'un employé avec un ID null ou vide");
                    return BadRequest(new { message = "L'ID de l'employé ne peut pas être null ou vide." });
                }

                logger.LogInformation("Vérification de l'existence de l'employé avec l'ID: {EmployeeId}", id);
                var existingEmployee = await employeeService.GetByIdAsync(id);
                if (existingEmployee == null)
                {
                    logger.LogWarning("Employé non trouvé pour l'ID: {EmployeeId}", id);
                    return NotFound(new { message = $"Aucun employé trouvé avec l'ID {id}." });
                }

                logger.LogInformation("Mise à jour de l'employé avec l'ID: {EmployeeId}", id);
                await employeeService.UpdateAsync(id, employeeForm);

                logger.LogInformation("Employé mis à jour avec succès pour l'ID: {EmployeeId}", id);
                return Ok(new
                {
                    success = true,
                    message = "Employé mis à jour avec succès.",
                    employeeId = id
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour de l'employé avec l'ID: {EmployeeId}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Une erreur est survenue lors de la mise à jour de l'employé."
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de suppression d'un employé avec un ID null ou vide");
                    return BadRequest(new { message = "L'ID de l'employé ne peut pas être null ou vide." });
                }

                logger.LogInformation("Vérification de l'existence de l'employé avec l'ID: {EmployeeId}", id);
                var employee = await employeeService.GetByIdAsync(id);
                if (employee == null)
                {
                    logger.LogWarning("Employé non trouvé pour l'ID: {EmployeeId}", id);
                    return NotFound(new { message = $"Aucun employé trouvé avec l'ID {id}." });
                }

                logger.LogInformation("Suppression de l'employé avec l'ID: {EmployeeId}", id);
                await employeeService.DeleteAsync(id);

                logger.LogInformation("Employé supprimé avec succès pour l'ID: {EmployeeId}", id);
                return Ok(new
                {
                    success = true,
                    message = "Employé supprimé avec succès.",
                    employeeId = id
                });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression de l'employé avec l'ID: {EmployeeId}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Une erreur est survenue lors de la suppression de l'employé."
                });
            }
        }


        [HttpGet("stats")]
        public async Task<ActionResult<EmployeeStats>> GetStatistics()
        {
            try
            {
                logger.LogInformation("Récupération des statistiques des employés");
                var stats = await employeeService.GetStatisticsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des statistiques des employés");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des statistiques des employés.");
            }
        }
    }
}