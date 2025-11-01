using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.employee;
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

        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult> GetAll()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var employees = await employeeService.GetAllAsync();
                return Ok(new { data = employees, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de tous les employés");
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la récupération de tous les employés");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost("search")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Search([FromBody] EmployeeSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                logger.LogInformation("Recherche paginée des employés avec filtres, page: {Page}, pageSize: {PageSize}", page, pageSize);
                var (results, totalCount) = await employeeService.SearchAsync(filters, page, pageSize);
                return Ok(new { data = results, totalCount, page, pageSize, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la recherche paginée des employés");
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la recherche paginée des employés");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetById(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de récupération d'un employé avec un ID null ou vide");
                    return BadRequest(new { data = (object?)null, status = 400, message = "L'ID de l'employé ne peut pas être null ou vide." });
                }

                logger.LogInformation("Récupération de l'employé avec l'ID: {EmployeeId}", id);
                var employee = await employeeService.GetByIdAsync(id);
                if (employee == null)
                {
                    logger.LogWarning("Employé non trouvé pour l'ID: {EmployeeId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Employé non trouvé." });
                }

                return Ok(new { data = employee, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de l'employé avec l'ID: {EmployeeId}", id);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la récupération de l'employé avec l'ID: {EmployeeId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("gender/{genderId}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetByGender(string genderId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                if (string.IsNullOrWhiteSpace(genderId))
                {
                    logger.LogWarning("Tentative de récupération des employés avec un ID de genre null ou vide");
                    return BadRequest(new { data = (object?)null, status = 400, message = "L'ID du genre ne peut pas être null ou vide." });
                }

                logger.LogInformation("Récupération des employés par genre: {GenderId}", genderId);
                var employees = await employeeService.GetByGenderAsync(genderId);
                return Ok(new { data = employees, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des employés par genre: {GenderId}", genderId);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la récupération des employés par genre: {GenderId}", genderId);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] EmployeeFormDTO employeeForm)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                if (!ModelState.IsValid)
                {
                    logger.LogWarning("Données invalides lors de la création d'un employé: {ModelStateErrors}", ModelState);
                    return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
                }

                logger.LogInformation("Création d'un nouvel employé");
                var createdEmployee = await employeeService.AddAsync(employeeForm);

                logger.LogInformation("Employé créé avec succès avec l'ID: {EmployeeId}", createdEmployee.EmployeeId);
                return CreatedAtAction(nameof(GetById), new { id = createdEmployee.EmployeeId }, new { data = createdEmployee, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la création de l'employé");
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la création de l'employé");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] EmployeeFormDTO employeeForm)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                if (!ModelState.IsValid)
                {
                    logger.LogWarning("Données invalides lors de la mise à jour d'un employé: {ModelStateErrors}", ModelState);
                    return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de mise à jour d'un employé avec un ID null ou vide");
                    return BadRequest(new { data = (object?)null, status = 400, message = "L'ID de l'employé ne peut pas être null ou vide." });
                }

                logger.LogInformation("Vérification de l'existence de l'employé avec l'ID: {EmployeeId}", id);
                var existingEmployee = await employeeService.GetByIdAsync(id);
                if (existingEmployee == null)
                {
                    logger.LogWarning("Employé non trouvé pour l'ID: {EmployeeId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Employé non trouvé." });
                }

                logger.LogInformation("Mise à jour de l'employé avec l'ID: {EmployeeId}", id);
                await employeeService.UpdateAsync(id, employeeForm);

                logger.LogInformation("Employé mis à jour avec succès pour l'ID: {EmployeeId}", id);
                return Ok(new { data = new { success = true, message = "Employé mis à jour avec succès.", employeeId = id }, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour de l'employé avec l'ID: {EmployeeId}", id);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la mise à jour de l'employé avec l'ID: {EmployeeId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Delete(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    logger.LogWarning("Tentative de suppression d'un employé avec un ID null ou vide");
                    return BadRequest(new { data = (object?)null, status = 400, message = "L'ID de l'employé ne peut pas être null ou vide." });
                }

                logger.LogInformation("Vérification de l'existence de l'employé avec l'ID: {EmployeeId}", id);
                var employee = await employeeService.GetByIdAsync(id);
                if (employee == null)
                {
                    logger.LogWarning("Employé non trouvé pour l'ID: {EmployeeId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Employé non trouvé." });
                }

                logger.LogInformation("Suppression de l'employé avec l'ID: {EmployeeId}", id);
                await employeeService.DeleteAsync(id);

                logger.LogInformation("Employé supprimé avec succès pour l'ID: {EmployeeId}", id);
                return Ok(new { data = new { success = true, message = "Employé supprimé avec succès.", employeeId = id }, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression de l'employé avec l'ID: {EmployeeId}", id);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la suppression de l'employé avec l'ID: {EmployeeId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("stats")]
        [AllowAnonymous]
        public async Task<ActionResult> GetStatistics()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                logger.LogInformation("Récupération des statistiques des employés");
                var stats = await employeeService.GetStatisticsAsync();
                return Ok(new { data = stats, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des statistiques des employés");
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la récupération des statistiques des employés");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("simple")]
        [AllowAnonymous]
        public async Task<ActionResult> GetAllSimple()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                logger.LogInformation("Récupération simple de tous les employés");
                var employees = await employeeService.GetAllEmployeeSimpleAsync();
                return Ok(new { data = employees, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération simple de tous les employés");
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la récupération simple de tous les employés");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost("simple")]
        [AllowAnonymous]
        public async Task<ActionResult> GetByMatriculeSimple([FromBody] string[] matricules)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                if (matricules == null || matricules.Length == 0)
                {
                    logger.LogWarning("Tentative de récupération des employés avec matricules null ou vide");
                    return BadRequest(new { data = (object?)null, status = 400, message = "Les matricules ne peuvent pas être null ou vides." });
                }

                logger.LogInformation("Récupération des employés par matricules: {MatriculeCount}", matricules.Length);
                var employees = await employeeService.GetByMatriculeSimpleAsync(matricules);
                return Ok(new { data = employees, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des employés par matricules");
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la récupération des employés par matricules");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}