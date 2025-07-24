using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Services.mission;
using MyApp.Api.Models.form.mission;
using MyApp.Api.Models.search.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class MissionAssignationController : ControllerBase
    {
        private readonly IMissionAssignationService _service;

        public MissionAssignationController(IMissionAssignationService service)
        {
            _service = service;
        }
        
        [HttpPost("generate-excel")]
        public async Task<IActionResult> GenerateExcel([FromBody] GeneratePaiementDTO generatePaiementDTO)
        {
            if (generatePaiementDTO == null || 
                string.IsNullOrWhiteSpace(generatePaiementDTO.EmployeeId) || 
                string.IsNullOrWhiteSpace(generatePaiementDTO.MissionId))
            {
                return BadRequest("Valid EmployeeId and MissionId are required.");
            }

            try
            {
                var excelBytes = await _service.GenerateExcelReportAsync(
                    generatePaiementDTO.EmployeeId,
                    generatePaiementDTO.MissionId);

                string excelName = $"MissionPaymentReport-{generatePaiementDTO.MissionId}-{DateTime.Now:yyyyMMddHHmmss}.xlsx";
                
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

        [HttpPost]
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] MissionAssignationDTOForm dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Return validation errors for debugging
            }

            try
            {
                var missionAssignation = new MissionAssignation(dto);
                var (employeeId, missionId, transportId) = await _service.CreateAsync(missionAssignation);
        
                // Handle null transportId in route values
                var routeValues = new { employeeId, missionId, transportId = transportId ?? string.Empty };
                return CreatedAtAction(nameof(GetById), routeValues, missionAssignation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
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

        [HttpPost("search")]
        public async Task<ActionResult<object>> Search([FromBody] MissionAssignationSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var (results, totalCount) = await _service.SearchAsync(filters, page, pageSize);
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
