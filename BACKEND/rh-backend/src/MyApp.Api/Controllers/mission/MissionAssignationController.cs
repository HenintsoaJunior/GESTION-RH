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
        private readonly IMissionAssignationService _service;

        public MissionAssignationController(IMissionAssignationService service)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        // Récupère les employés non assignés à une mission spécifique
        [HttpGet("not-assigned/{missionId}")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployeesNotAssignedToMission(string missionId)
        {
            if (string.IsNullOrWhiteSpace(missionId))
            {
                return BadRequest("L'identifiant de la mission est requis.");
            }

            try
            {
                var employees = await _service.GetEmployeesNotAssignedToMissionAsync(missionId);
                return Ok(employees);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur serveur : {ex.Message}");
            }
        }

        // Génère et télécharge un rapport Excel des paiements de mission
        [HttpPost("generate-excel")]
        public async Task<IActionResult> GenerateExcel([FromBody] GeneratePaiementDTO generatePaiementDTO)
        {
            if (generatePaiementDTO == null || string.IsNullOrWhiteSpace(generatePaiementDTO.MissionId))
            {
                return BadRequest("Les données de paiement ou l'identifiant de la mission sont requis.");
            }

            try
            {
                var excelBytes = await _service.GenerateExcelReportAsync(
                    generatePaiementDTO.EmployeeId,
                    generatePaiementDTO.MissionId,
                    generatePaiementDTO.DirectionId,
                    generatePaiementDTO.StartDate,
                    generatePaiementDTO.EndDate);

                string excelName = $"MissionPaymentReport-{generatePaiementDTO.MissionId}-{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelName);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la génération du fichier Excel : {ex.Message}");
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
                return StatusCode(500, $"Erreur serveur : {ex.Message}");
            }
        }

        // Récupère une assignation par identifiants (employé, mission)
        [HttpGet("{employeeId}/{missionId}")]
        public async Task<ActionResult<MissionAssignation>> GetById(string employeeId, string missionId)
        {
            if (string.IsNullOrWhiteSpace(employeeId) || string.IsNullOrWhiteSpace(missionId))
            {
                return BadRequest("Les identifiants de l'employé et de la mission sont requis.");
            }

            try
            {
                var missionAssignation = await _service.GetByIdAsync(employeeId, missionId, null);
                if (missionAssignation == null)
                {
                    return NotFound("Aucune assignation trouvée pour ces identifiants.");
                }
                return Ok(missionAssignation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur serveur : {ex.Message}");
            }
        }

        // Crée une nouvelle assignation de mission
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] MissionAssignationDTOForm dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var missionAssignation = new MissionAssignation(dto);
                var (employeeId, missionId, transportId) = await _service.CreateAsync(missionAssignation);

                var routeValues = new { employeeId, missionId };
                return CreatedAtAction(nameof(GetById), routeValues, missionAssignation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la création de l'assignation : {ex.Message}");
            }
        }

        // Met à jour une assignation existante
        [HttpPut("{employeeId}/{missionId}")]
        public async Task<ActionResult> Update(string employeeId, string missionId, [FromBody] MissionAssignationDTOForm dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(employeeId) || string.IsNullOrWhiteSpace(missionId))
            {
                return BadRequest("Les identifiants de l'employé et de la mission sont requis.");
            }

            if (dto.EmployeeId != employeeId || dto.MissionId != missionId)
            {
                return BadRequest("Les identifiants dans l'URL doivent correspondre à ceux du corps de la requête.");
            }

            try
            {
                var missionAssignation = new MissionAssignation(dto);
                var success = await _service.UpdateAsync(missionAssignation);
                if (!success)
                {
                    return NotFound("Aucune assignation trouvée pour ces identifiants.");
                }
                return Ok(missionAssignation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la mise à jour de l'assignation : {ex.Message}");
            }
        }

        // Supprime une assignation de mission
        [HttpDelete("{employeeId}/{missionId}")]
        public async Task<ActionResult> Delete(string employeeId, string missionId)
        {
            if (string.IsNullOrWhiteSpace(employeeId) || string.IsNullOrWhiteSpace(missionId))
            {
                return BadRequest("Les identifiants de l'employé et de la mission sont requis.");
            }

            try
            {
                var success = await _service.DeleteAsync(employeeId, missionId);
                if (!success)
                {
                    return NotFound("Aucune assignation trouvée pour ces identifiants.");
                }
                return Ok("Assignation supprimée avec succès.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la suppression de l'assignation : {ex.Message}");
            }
        }

        // Recherche paginée avec filtres dynamiques
        [HttpPost("search")]
        public async Task<ActionResult<object>> Search([FromBody] MissionAssignationSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1 || pageSize < 1)
            {
                return BadRequest("La page et la taille de la page doivent être supérieures à 0.");
            }

            try
            {
                var (results, totalCount) = await _service.SearchAsync(filters, page, pageSize);
                return Ok(new
                {
                    Data = results,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la recherche : {ex.Message}");
            }
        }
    }
}