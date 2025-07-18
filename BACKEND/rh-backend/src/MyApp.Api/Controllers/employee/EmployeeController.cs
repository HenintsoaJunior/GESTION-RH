using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.employee;
using MyApp.Api.Services.employe;
using System;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.employee
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;
        private readonly ILogger<EmployeeController> _logger;

        public EmployeeController(
            IEmployeeService employeeService,
            ILogger<EmployeeController> logger)
        {
            _employeeService = employeeService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetAll()
        {
            try
            {
                _logger.LogInformation("Récupération de tous les employés");
                var employees = await _employeeService.GetAllAsync();
                return Ok(employees);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les employés");
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
                    _logger.LogWarning("Tentative de récupération d'un employé avec un ID null ou vide");
                    return BadRequest("L'ID de l'employé ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Récupération de l'employé avec l'ID: {EmployeeId}", id);
                var employee = await _employeeService.GetByIdAsync(id);
                if (employee == null)
                {
                    _logger.LogWarning("Employé non trouvé pour l'ID: {EmployeeId}", id);
                    return NotFound();
                }

                return Ok(employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de l'employé avec l'ID: {EmployeeId}", id);
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
                    _logger.LogWarning("Tentative de récupération des employés avec un ID de genre null ou vide");
                    return BadRequest("L'ID du genre ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Récupération des employés par genre: {GenderId}", genderId);
                var employees = await _employeeService.GetByGenderAsync(genderId);
                return Ok(employees);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des employés par genre: {GenderId}", genderId);
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
                    _logger.LogWarning("Tentative de récupération des employés avec un statut null ou vide");
                    return BadRequest("Le statut ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Récupération des employés par statut: {Status}", status);
                var employees = await _employeeService.GetByStatusAsync(status);
                return Ok(employees);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des employés par statut: {Status}", status);
                return StatusCode(500, "Une erreur est survenue lors de la récupération des employés par statut.");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Employee>> Create([FromBody] Employee employee)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Données invalides lors de la création d'un employé: {ModelStateErrors}", ModelState);
                    return BadRequest(ModelState);
                }

                _logger.LogInformation("Création d'un nouvel employé");
                await _employeeService.AddAsync(employee);

                _logger.LogInformation("Employé créé avec succès avec l'ID: {EmployeeId}", employee.EmployeeId);
                return CreatedAtAction(nameof(GetById), new { id = employee.EmployeeId }, employee);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de l'employé avec l'ID: {EmployeeId}", employee?.EmployeeId);
                return StatusCode(500, "Une erreur est survenue lors de la création de l'employé.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Employee employee)
        {
            try
            {
                if (id != employee.EmployeeId)
                {
                    _logger.LogWarning("L'ID dans l'URL ({Id}) ne correspond pas à l'ID de l'employé ({EmployeeId})", id, employee.EmployeeId);
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'ID de l'employé.");
                }

                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de mise à jour d'un employé avec un ID null ou vide");
                    return BadRequest("L'ID de l'employé ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Vérification de l'existence de l'employé avec l'ID: {EmployeeId}", id);
                var existingEmployee = await _employeeService.GetByIdAsync(id);
                if (existingEmployee == null)
                {
                    _logger.LogWarning("Employé non trouvé pour l'ID: {EmployeeId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Mise à jour de l'employé avec l'ID: {EmployeeId}", id);
                await _employeeService.UpdateAsync(employee);

                _logger.LogInformation("Employé mis à jour avec succès pour l'ID: {EmployeeId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'employé avec l'ID: {EmployeeId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de l'employé.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                {
                    _logger.LogWarning("Tentative de suppression d'un employé avec un ID null ou vide");
                    return BadRequest("L'ID de l'employé ne peut pas être null ou vide.");
                }

                _logger.LogInformation("Vérification de l'existence de l'employé avec l'ID: {EmployeeId}", id);
                var employee = await _employeeService.GetByIdAsync(id);
                if (employee == null)
                {
                    _logger.LogWarning("Employé non trouvé pour l'ID: {EmployeeId}", id);
                    return NotFound();
                }

                _logger.LogInformation("Suppression de l'employé avec l'ID: {EmployeeId}", id);
                await _employeeService.DeleteAsync(id);

                _logger.LogInformation("Employé supprimé avec succès pour l'ID: {EmployeeId}", id);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'employé avec l'ID: {EmployeeId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de l'employé.");
            }
        }
    }
}