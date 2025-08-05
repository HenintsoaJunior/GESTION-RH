using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Services.mission;
using MyApp.Api.Models.form.mission;
using MyApp.Api.Models.search.mission;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class MissionAssignationController : ControllerBase
    {
        // Service injecté pour la gestion des assignations de mission
        private readonly IMissionAssignationService _service;

        public MissionAssignationController(IMissionAssignationService service)
        {
            _service = service;
        }

        [HttpPost("import-csv")]
        public async Task<IActionResult> ImportCsv(IFormFile file, [FromQuery] char separator = ',')
        {
            if (file == null || file.Length == 0)
                return BadRequest("Fichier non valide.");

            using var stream = file.OpenReadStream();
            var result = await _service.ImportMissionFromCsv(stream, separator);
            return Ok(result);
        }

        // Récupère les employés non assignés à une mission spécifique
        [HttpGet("not-assigned/{missionId}")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployeesNotAssignedToMission(string missionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(missionId))
                {
                    return BadRequest("Valid MissionId is required.");
                }

                var employees = await _service.GetEmployeesNotAssignedToMissionAsync(missionId);
                return Ok(employees);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Génère et télécharge un rapport Excel des paiements de mission
        [HttpPost("generate-excel")]
        public async Task<IActionResult> GenerateExcel([FromBody] GeneratePaiementDTO generatePaiementDTO)
        {
            try
            {
                var excelBytes = await _service.GenerateExcelReportAsync(
                    generatePaiementDTO.EmployeeId,
                    generatePaiementDTO.MissionId,
                    generatePaiementDTO.DirectionId,
                    generatePaiementDTO.StartDate,
                    generatePaiementDTO.EndDate);

                string excelName = $"MissionPaymentReport-{generatePaiementDTO.MissionId}-{DateTime.Now:yyyyMMddHHmmss}.xlsx";
        
                // Retourne le fichier Excel généré
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelName);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while generating the Excel file: {ex.Message}");
            }
        }
        // Récupère toutes les assignations de mission
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MissionAssignation>>> GetAll()
        {
            try
            {
                var missionAssignations = await _service.GetAllAsync();
                return Ok(missionAssignations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Récupère une assignation par identifiants (employé, mission, transport)
        [HttpGet("{employeeId}/{missionId}/{transportId?}")]
        public async Task<ActionResult<MissionAssignation>> GetById(string employeeId, string missionId, string? transportId)
        {
            var missionAssignation = await _service.GetByIdAsync(employeeId, missionId, transportId);
            if (missionAssignation == null)
            {
                return NotFound();
            }
            return Ok(missionAssignation);
        }

        // Crée une nouvelle assignation de mission
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] MissionAssignationDTOForm dto)
        {
            // Vérifie la validité du modèle reçu
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Retourne les erreurs de validation
            }

            try
            {
                var missionAssignation = new MissionAssignation(dto);
                var (employeeId, missionId, transportId) = await _service.CreateAsync(missionAssignation);
        
                // Retourne l'URL de la ressource créée
                var routeValues = new { employeeId, missionId, transportId = transportId ?? string.Empty };
                return CreatedAtAction(nameof(GetById), routeValues, missionAssignation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        // Met à jour une assignation existante
        [HttpPut("{employeeId}/{missionId}/{transportId}")]
        public async Task<ActionResult> Update(string employeeId, string missionId, string transportId, [FromBody] MissionAssignationDTOForm dto)
        {
            try
            {
                var missionAssignation = new MissionAssignation(dto);

                var success = await _service.UpdateAsync(missionAssignation);
                if (!success)
                {
                    return NotFound("Mission assignation not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Supprime une assignation de mission
        [HttpDelete("{employeeId}/{missionId}/{transportId}")]
        public async Task<ActionResult> Delete(string employeeId, string missionId, string transportId)
        {
            try
            {
                var success = await _service.DeleteAsync(employeeId, missionId, transportId);
                if (!success)
                {
                    return NotFound("Mission assignation not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Recherche paginée avec filtres dynamiques
        [HttpPost("search")]
        public async Task<ActionResult<object>> Search([FromBody] MissionAssignationSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var (results, totalCount) = await _service.SearchAsync(filters, page, pageSize);
                // Retourne les résultats paginés et le nombre total
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
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
