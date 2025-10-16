using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Services.mission;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.mission;
using Microsoft.AspNetCore.Authorization;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class MissionAssignationController(IMissionAssignationService service, IMissionService missionService, ILogger<MissionAssignationController> logger)
        : ControllerBase
    {
        private readonly IMissionAssignationService _service = service ?? throw new ArgumentNullException(nameof(service));
        private readonly IMissionService _missionService = missionService ?? throw new ArgumentNullException(nameof(missionService));
        private readonly ILogger<MissionAssignationController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));


        [HttpPost("search")]
        [AllowAnonymous]
        public async Task<ActionResult> Search([FromBody] MissionAssignationSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (page < 1 || pageSize < 1)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "La page et la taille de la page doivent être supérieures à 0." });
            }

            try
            {
                var (results, totalCount) = await _service.SearchAsync(filters, page, pageSize);
                var responseData = new
                {
                    Data = results,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize
                };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost("OM")]
        [AllowAnonymous]
        public async Task<IActionResult> GenerateOM([FromBody] GenerateOMDTO generateOM)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }
            if (generateOM == null || string.IsNullOrWhiteSpace(generateOM.MissionId))
            {
                _logger.LogWarning("Les données ou l'identifiant de la mission sont absents pour la génération de l'ordre de mission.");
                return BadRequest("Les données ou l'identifiant de la mission sont requis.");
            }

            try
            {
                var pdfBytes = await _service.GenerateMissionOrderPDFAsync(generateOM.EmployeeId, generateOM.MissionId);

                var pdfName = $"OrdreMission-{generateOM.MissionId}-{DateTime.Now:yyyyMMddHHmmss}.pdf";

                return File(pdfBytes, "application/pdf", pdfName);
            }
            catch (FileNotFoundException ex)
            {
                _logger.LogWarning(ex, "Template file not found for mission {MissionId}", generateOM.MissionId);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur serveur lors de la génération de l'ordre de mission pour la mission {MissionId}", generateOM.MissionId);
                return StatusCode(500, $"Erreur lors de la génération de l'ordre de mission : {ex.Message}");
            }
        }
        
        //
        [HttpPost("import-csv")]
        public async Task<IActionResult> ImportCsv(IFormFile? file, [FromQuery] char separator = ';')
        {
            if (file == null || file.Length == 0)
            {
                _logger.LogWarning("Tentative d'importation de CSV avec un fichier vide ou non valide.");
                return BadRequest("Fichier non valide.");
            }

            try
            {
                await using var stream = file.OpenReadStream();
                var result = await _service.ImportMissionFromCsv(stream, separator, (MissionService)_missionService);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'importation du fichier CSV.");
                return StatusCode(500, $"Erreur lors de l'importation du fichier CSV : {ex.Message}");
            }
        }

        [HttpPost("duration")]
        public async Task<IActionResult> GetDuration(DateTime startDate, DateTime endDate)
        {
            try
            {
                var duration = await Task.Run(() => _service.CalculateDuration(startDate, endDate));
                return Ok(duration);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du calcul de la durée entre {StartDate} et {EndDate}", startDate, endDate);
                return StatusCode(500, $"Erreur lors du calcul de la durée : {ex.Message}");
            }
        }

        [HttpGet("not-assigned/{missionId}")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetEmployeesNotAssignedToMission(string missionId)
        {
            if (string.IsNullOrWhiteSpace(missionId))
            {
                _logger.LogWarning("L'identifiant de la mission est vide ou null pour la récupération des employés non assignés.");
                return BadRequest("L'identifiant de la mission est requis.");
            }

            try
            {
                var employees = await _service.GetEmployeesNotAssignedToMissionAsync(missionId);
                return Ok(employees);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Aucun employé non assigné trouvé pour la mission {MissionId}", missionId);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur serveur lors de la récupération des employés non assignés pour la mission {MissionId}", missionId);
                return StatusCode(500, $"Erreur serveur : {ex.Message}");
            }
        }

        [HttpPost("generate-excel")]
        public async Task<IActionResult> GenerateExcel([FromBody] GeneratePaiementDTO? generatePaiementDto)
        {
            if (generatePaiementDto == null || string.IsNullOrWhiteSpace(generatePaiementDto.MissionId))
            {
                _logger.LogWarning("Les données de paiement ou l'identifiant de la mission sont absents pour la génération du rapport Excel.");
                return BadRequest("Les données de paiement ou l'identifiant de la mission sont requis.");
            }

            try
            {
                var excelBytes = await _service.GenerateExcelReportAsync(
                    generatePaiementDto.EmployeeId,
                    generatePaiementDto.MissionId);

                var excelName = $"MissionPaymentReport-{generatePaiementDto.MissionId}-{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                return File(excelBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", excelName);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning(ex, "Erreur lors de la génération du rapport Excel pour la mission {MissionId}", generatePaiementDto.MissionId);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur serveur lors de la génération du rapport Excel pour la mission {MissionId}", generatePaiementDto.MissionId);
                return StatusCode(500, $"Erreur lors de la génération du fichier Excel : {ex.Message}");
            }
        }

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
                _logger.LogError(ex, "Erreur serveur lors de la récupération de toutes les assignations de mission");
                return StatusCode(500, $"Erreur serveur : {ex.Message}");
            }
        }

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
                if (missionAssignation != null) return Ok(missionAssignation);
                return NotFound("Aucune assignation trouvée pour ces identifiants.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur serveur lors de la récupération de l'assignation pour EmployeeId: {EmployeeId}, MissionId: {MissionId}", employeeId, missionId);
                return StatusCode(500, $"Erreur serveur : {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] MissionAssignationDTOForm dto)
        {
            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Échec de la validation du modèle pour la création de l'assignation. Erreurs: {Errors}", string.Join("; ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)));
                return BadRequest(ModelState);
            }

            try
            {
                var missionAssignation = new MissionAssignation(dto);
                var (employeeId, missionId, assignationId, transportId) = await _service.CreateAsync(missionAssignation);

                var routeValues = new { employeeId, missionId };
                return CreatedAtAction(nameof(GetById), routeValues, missionAssignation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de l'assignation pour EmployeeId: {EmployeeId}, MissionId: {MissionId}", dto.EmployeeId, dto.MissionId);
                return StatusCode(500, $"Erreur lors de la création de l'assignation : {ex.Message}");
            }
        }

        [HttpPut("{assignationId}")]
        public async Task<ActionResult> Update(string assignationId, [FromBody] MissionAssignationDTOForm dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(assignationId))
            {
                return BadRequest("L'identifiant de l'assignation est requis.");
            }

            try
            {
                var missionAssignation = new MissionAssignation(dto);
                var success = await _service.UpdateAsync(assignationId, missionAssignation);
                if (success) return Ok(missionAssignation);
                _logger.LogWarning("Aucune assignation trouvée pour l'identifiant: {AssignationId}", assignationId);
                return NotFound("Aucune assignation trouvée pour cet identifiant.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour de l'assignation ID: {AssignationId}", assignationId);
                return StatusCode(500, $"Erreur lors de la mise à jour de l'assignation : {ex.Message}");
            }
        }

        [HttpDelete("{assignationId}")]
        public async Task<ActionResult> Delete(string assignationId)
        {
            if (string.IsNullOrWhiteSpace(assignationId))
            {
                _logger.LogWarning("L'identifiant de l'assignation est vide ou null pour la suppression.");
                return BadRequest("L'identifiant de l'assignation est requis.");
            }

            try
            {
                var success = await _service.DeleteAsync(assignationId);
                if (success) return Ok("Assignation supprimée avec succès.");
                _logger.LogWarning("Aucune assignation trouvée pour l'identifiant: {AssignationId}", assignationId);
                return NotFound("Aucune assignation trouvée pour cet identifiant.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression de l'assignation ID: {AssignationId}", assignationId);
                return StatusCode(500, $"Erreur lors de la suppression de l'assignation : {ex.Message}");
            }
        }

        [HttpGet("{assignationId}")]
        public async Task<IActionResult> GetByAssignationId(string assignationId)
        {
            try
            {
                var missionAssignation = await _service.GetByAssignationIdAsync(assignationId);
                
                if (missionAssignation == null)
                {
                    return NotFound(new { Message = $"No mission assignation found for AssignationId: {assignationId}" });
                }

                return Ok(missionAssignation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Error retrieving mission assignation: {ex.Message}" });
            }
        }

    }
}