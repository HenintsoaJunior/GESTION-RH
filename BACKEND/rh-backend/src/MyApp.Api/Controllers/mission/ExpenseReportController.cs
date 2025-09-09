using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpenseReportController : ControllerBase
    {
        private readonly IExpenseReportService _service;
        private readonly ILogger<ExpenseReportController> _logger;

        public ExpenseReportController(IExpenseReportService service, ILogger<ExpenseReportController> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // GET: api/ExpenseReport
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExpenseReport>>> GetAll()
        {
            var reports = await _service.GetAllAsync();
            return Ok(reports);
        }

        // GET: api/ExpenseReport/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ExpenseReport>> GetById(string id)
        {
            try
            {
                var report = await _service.GetByIdAsync(id);
                return Ok(report);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetById pour ExpenseReportId: {ExpenseReportId}", id);
                return NotFound(new { message = ex.Message });
            }
        }

        // GET: api/ExpenseReport/assignation/{assignationId}
        [HttpGet("assignation/{assignationId}")]
        public async Task<ActionResult<object>> GetByAssignationId(string assignationId)
        {
            try
            {
                var (reports, totalAmount) = await _service.GetByAssignationIdAsync(assignationId);
                return Ok(new { reports, totalAmount });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetByAssignationId pour AssignationId: {AssignationId}", assignationId);
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/ExpenseReport
        [HttpPost]
        public async Task<ActionResult<string>> Create([FromBody] ExpenseReportDTOForm dto)
        {
            try
            {
                var id = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id }, id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de Create ExpenseReport");
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/ExpenseReport/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] ExpenseReportDTOForm dto)
        {
            try
            {
                var success = await _service.UpdateAsync(id, dto);
                if (!success)
                {
                    return NotFound(new { message = $"Rapport de frais avec l'ID {id} introuvable." });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de Update pour ExpenseReportId: {ExpenseReportId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/ExpenseReport/{id}?userId=USER123
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id, [FromQuery] string userId)
        {
            try
            {
                var success = await _service.DeleteAsync(id, userId);
                if (!success)
                {
                    return NotFound(new { message = $"Rapport de frais avec l'ID {id} introuvable." });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de Delete pour ExpenseReportId: {ExpenseReportId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
