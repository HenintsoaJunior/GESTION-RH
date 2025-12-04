using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompensationController : ControllerBase
    {
        private readonly ICompensationService _compensationService;
        private readonly IMissionService _missionService;

        public CompensationController(
            ICompensationService compensationService,
            IMissionService missionService)
        {
            _compensationService = compensationService ?? throw new ArgumentNullException(nameof(compensationService));
            _missionService = missionService ?? throw new ArgumentNullException(nameof(missionService));
        }

        // GET: api/Compensation/by-employee/E001/mission/M123
        [HttpGet("by-employee/{employeeId}/mission/{missionId}")]
        public async Task<ActionResult> GetByEmployeeAndMission(string employeeId, string missionId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            if (string.IsNullOrWhiteSpace(employeeId) || string.IsNullOrWhiteSpace(missionId))
                return BadRequest(new { data = (object?)null, status = 400, message = "Les IDs employé et mission sont requis" });

            try
            {
                var result = await _compensationService.GetByEmployeeIdAsync(employeeId, missionId);

                if (result == null || result.Mission == null)
                    return NotFound(new { data = (object?)null, status = 404, message = $"Aucune compensation trouvée pour l'employé {employeeId} et la mission {missionId}" });

                return Ok(new { data = result, status = 200, message = "success" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = "Erreur serveur", error = ex.Message });
            }
        }

        // GET: api/Compensation/total-paid
        [HttpGet("total-paid")]
        public async Task<ActionResult> GetTotalPaidAmount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            try
            {
                var total = await _compensationService.GetTotalPaidAmountAsync();
                return Ok(new { data = new { totalPaidAmount = total }, status = 200, message = "success" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = "Erreur lors du calcul du total payé", error = ex.Message });
            }
        }

        // GET: api/Compensation/total-notpaid
        [HttpGet("total-notpaid")]
        public async Task<ActionResult> GetTotalNotPaidAmount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            try
            {
                var total = await _compensationService.GetTotalNotPaidAmountAsync();
                return Ok(new { data = new { totalNotPaidAmount = total }, status = 200, message = "success" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = "Erreur lors du calcul du total non payé", error = ex.Message });
            }
        }

        // GET: api/Compensation/by-status?status=paid&page=1&pageSize=10
        [HttpGet("by-status")]
        public async Task<ActionResult> GetByStatus([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            if (page < 1 || pageSize < 1)
                return BadRequest(new { data = (object?)null, status = 400, message = "page et pageSize doivent être supérieurs à 0" });

            try
            {
                var (results, totalCount) = await _compensationService.GetCompensationsByStatusAsync(status, page, pageSize);

                var response = new
                {
                    items = results,
                    totalCount,
                    page,
                    pageSize,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
                };

                return Ok(new { data = response, status = 200, message = "success" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = "Erreur lors de la récupération des compensations par statut", error = ex.Message });
            }
        }

        // GET: api/Compensation
        [HttpGet]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                var compensations = await _compensationService.GetAllAsync();
                return Ok(new { data = compensations, status = 200, message = "success" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = "Erreur lors de la récupération de toutes les compensations", error = ex.Message });
            }
        }

        // POST: api/Compensation/generate-excel
        [HttpPost("generate-excel")]
        public async Task<IActionResult> GenerateExcel([FromBody] GeneratePaiementDTO? dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.MissionId) || string.IsNullOrWhiteSpace(dto.EmployeeId))
                return BadRequest(new { data = (object?)null, status = 400, message = "MissionId et EmployeeId sont requis dans le corps de la requête" });

            try
            {
                var excelBytes = await _missionService.GenerateExcelReportAsync(dto.EmployeeId, dto.MissionId);

                var fileName = $"Rapport_Indemnites_Mission_{dto.MissionId}_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

                return File(
                    excelBytes,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { data = (object?)null, status = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = "Erreur lors de la génération du fichier Excel", error = ex.Message });
            }
        }

        // PUT: api/Compensation/employee/E001/mission/M123/status
        [HttpPut("employee/{employeeId}/mission/{missionId}/status")]
        public async Task<ActionResult> UpdateStatus(string employeeId, string missionId, [FromBody] CompensationStatusUpdateDTO dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });

            if (string.IsNullOrWhiteSpace(employeeId) || string.IsNullOrWhiteSpace(missionId))
                return BadRequest(new { data = (object?)null, status = 400, message = "employeeId et missionId sont requis" });

            if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
                return BadRequest(new { data = (object?)null, status = 400, message = "Le champ 'status' est requis" });

            try
            {
                var updated = await _compensationService.UpdateStatusAsync(employeeId, missionId, dto.Status);

                if (!updated)
                    return NotFound(new { data = (object?)null, status = 404, message = $"Compensation non trouvée pour l'employé {employeeId} et la mission {missionId}" });

                return Ok(new
                {
                    data = (object?)null,
                    status = 200,
                    message = $"Statut mis à jour avec succès : {dto.Status}"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = "Erreur lors de la mise à jour du statut", error = ex.Message });
            }
        }
    }

    // DTO pour la mise à jour du statut
    public class CompensationStatusUpdateDTO
    {
        public string Status { get; set; } = string.Empty;
    }
}