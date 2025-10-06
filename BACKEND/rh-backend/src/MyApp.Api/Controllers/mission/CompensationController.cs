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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var compensations = await _compensationService.GetAllAsync();
                return Ok(compensations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving compensations", Error = ex.Message });
            }
        }

        [HttpPost("generate-excel")]
        public async Task<IActionResult> GenerateExcel([FromBody] GeneratePaiementDTO? generatePaiementDto)
        {
            if (generatePaiementDto == null || string.IsNullOrWhiteSpace(generatePaiementDto.MissionId))
            {
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
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la génération du fichier Excel : {ex.Message}");
            }
        }

        [HttpGet("by-employee/{employeeId}/mission/{missionId}")]
        public async Task<IActionResult> GetByEmployeeId(string employeeId, string missionId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(employeeId) || string.IsNullOrWhiteSpace(missionId))
                {
                    return BadRequest(new { Message = "Employee ID and Mission ID cannot be null or empty" });
                }

                var result = await _compensationService.GetByEmployeeIdAsync(employeeId, missionId);
                if (result.Assignation == null)
                {
                    return NotFound(new { Message = $"No assignation found for employee {employeeId} and mission {missionId}" });
                }

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving compensations", Error = ex.Message });
            }
        }

        [HttpPut("{employeId}/{assignation_id}/status")]
        public async Task<IActionResult> UpdateStatus(string employeId, string assignation_id, [FromBody] string status)
        {
            if (string.IsNullOrEmpty(employeId) || string.IsNullOrEmpty(assignation_id))
            {
                return BadRequest(new { message = "Employee ID and Assignation ID must be provided." });
            }

            if (string.IsNullOrEmpty(status))
            {
                return BadRequest(new { message = "Status cannot be null or empty" });
            }

            try
            {
                var updated = await _compensationService.UpdateStatusAsync(employeId, assignation_id, status);

                if (!updated)
                {
                    return NotFound(new { message = $"Compensation for Employee ID {employeId} and Assignation ID {assignation_id} not found." });
                }

                return Ok(new
                {
                    message = $"Compensation status for Employee ID {employeId} and Assignation ID {assignation_id} successfully updated to {status}"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the compensation status", error = ex.Message });
            }
        }

        [HttpGet("by-status")]
        public async Task<IActionResult> GetByStatus([FromQuery] string? status)
        {
            try
            {
                var results = await _compensationService.GetCompensationsByStatusAsync(status);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving compensations by status", Error = ex.Message });
            }
        }

        [HttpGet("total-paid")]
        public async Task<IActionResult> GetTotalPaidAmount()
        {
            try
            {
                var totalAmount = await _compensationService.GetTotalPaidAmountAsync();
                return Ok(new { TotalPaidAmount = totalAmount });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving total paid amount", Error = ex.Message });
            }
        }
        
        [HttpGet("total-notpaid")]
        public async Task<IActionResult> GetTotalNotPaidAmount()
        {
            try
            {
                var totalAmount = await _compensationService.GetTotalNotPaidAmountAsync();
                return Ok(new { TotalNotPaidAmount = totalAmount });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving total paid amount", Error = ex.Message });
            }
        }
    }
}