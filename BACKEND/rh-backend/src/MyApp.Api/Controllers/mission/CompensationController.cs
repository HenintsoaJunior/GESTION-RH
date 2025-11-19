using Microsoft.AspNetCore.Authorization;
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
        private readonly IMissionAssignationService _service;

        public CompensationController(ICompensationService compensationService, IMissionAssignationService service)
        {
            _compensationService = compensationService ?? throw new ArgumentNullException(nameof(compensationService));
            _service = service ?? throw new ArgumentNullException(nameof(service));
        }

        [HttpGet("by-employee/{employeeId}/mission/{missionId}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetByEmployeeId(string employeeId, string missionId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(employeeId) || string.IsNullOrWhiteSpace(missionId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Employee ID and Mission ID cannot be null or empty" });
            }

            try
            {
                var result = await _compensationService.GetByEmployeeIdAsync(employeeId, missionId);
                if (result.Assignation == null)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = $"No assignation found for employee {employeeId} and mission {missionId}" });
                }

                var responseData = result;
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

        [HttpGet("total-paid")]
        [AllowAnonymous]
        public async Task<ActionResult> GetTotalPaidAmount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var totalAmount = await _compensationService.GetTotalPaidAmountAsync();
                var responseData = new { TotalPaidAmount = totalAmount };
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

        [HttpGet("total-notpaid")]
        [AllowAnonymous]
        public async Task<ActionResult> GetTotalNotPaidAmount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var totalAmount = await _compensationService.GetTotalNotPaidAmountAsync();
                var responseData = new { TotalNotPaidAmount = totalAmount };
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

        [HttpGet("by-status")]
        [AllowAnonymous]
        public async Task<ActionResult> GetByStatus([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
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
                var (results, totalCount) = await _compensationService.GetCompensationsByStatusAsync(status, page, pageSize);
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
                return StatusCode(500, new { data = (object?)null, status = 500, message = "An error occurred while retrieving compensations by status" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var compensations = await _compensationService.GetAllAsync();
                return Ok(new { data = compensations, status = 200, message = "success" });
            }
            catch (Exception)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = "An error occurred while retrieving compensations" });
            }
        }

        [HttpPost("generate-excel")]
        public async Task<IActionResult> GenerateExcel([FromBody] GeneratePaiementDTO? generatePaiementDto)
        {
            if (generatePaiementDto == null || string.IsNullOrWhiteSpace(generatePaiementDto.MissionId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Les données de paiement ou l'identifiant de la mission sont requis." });
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
                return NotFound(new { data = (object?)null, status = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = $"Erreur lors de la génération du fichier Excel : {ex.Message}" });
            }
        }

        [HttpPut("{employeId}/{assignation_id}/status")]
        [AllowAnonymous]
        public async Task<ActionResult> UpdateStatus(string employeId, string assignation_id, [FromBody] string status)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrEmpty(employeId) || string.IsNullOrEmpty(assignation_id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Employee ID and Assignation ID must be provided." });
            }

            if (string.IsNullOrEmpty(status))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Status cannot be null or empty" });
            }

            try
            {
                var updated = await _compensationService.UpdateStatusAsync(employeId, assignation_id, status);

                if (!updated)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = $"Compensation for Employee ID {employeId} and Assignation ID {assignation_id} not found." });
                }

                return Ok(new { data = (object?)null, status = 200, message = $"Compensation status for Employee ID {employeId} and Assignation ID {assignation_id} successfully updated to {status}" });
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
    }
}