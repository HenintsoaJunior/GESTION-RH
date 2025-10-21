using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExpenseReportTypeController : ControllerBase
    {
        private readonly IExpenseReportTypeService _service;
        private readonly ILogger<ExpenseReportTypeController> _logger;

        public ExpenseReportTypeController(IExpenseReportTypeService service, ILogger<ExpenseReportTypeController> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // GET: api/ExpenseReportType
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
                var types = await _service.GetAllAsync();
                return Ok(new { data = types, status = 200, message = "success" });
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

//
        // GET: api/ExpenseReportType/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ExpenseReportType>> GetById(string id)
        {
            try
            {
                var type = await _service.GetByIdAsync(id);
                if (type == null)
                {
                    return NotFound(new { message = $"Type de rapport de frais avec l'ID {id} introuvable." });
                }
                return Ok(type);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetById pour ExpenseReportTypeId: {ExpenseReportTypeId}", id);
                return NotFound(new { message = ex.Message });
            }
        }

        // POST: api/ExpenseReportType
        [HttpPost]
        public async Task<ActionResult<string>> Create([FromBody] ExpenseReportType expenseReportType)
        {
            try
            {
                var id = await _service.CreateAsync(expenseReportType);
                return CreatedAtAction(nameof(GetById), new { id }, id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de Create ExpenseReportType");
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/ExpenseReportType/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] ExpenseReportType expenseReportType)
        {
            try
            {
                var success = await _service.UpdateAsync(id, expenseReportType);
                if (!success)
                {
                    return NotFound(new { message = $"Type de rapport de frais avec l'ID {id} introuvable." });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de Update pour ExpenseReportTypeId: {ExpenseReportTypeId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/ExpenseReportType/{id}?userId=USER123
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id, [FromQuery] string userId)
        {
            try
            {
                var success = await _service.DeleteAsync(id, userId);
                if (!success)
                {
                    return NotFound(new { message = $"Type de rapport de frais avec l'ID {id} introuvable." });
                }
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de Delete pour ExpenseReportTypeId: {ExpenseReportTypeId}", id);
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}