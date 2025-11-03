using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpenseTypeController : ControllerBase
    {
        private readonly IExpenseTypeService _expenseTypeService;
        private readonly ILogger<ExpenseTypeController> _logger;

        public ExpenseTypeController(IExpenseTypeService expenseTypeService, ILogger<ExpenseTypeController> logger)
        {
            _expenseTypeService = expenseTypeService ?? throw new ArgumentNullException(nameof(expenseTypeService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

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
                _logger.LogInformation("Retrieving all expense types");
                var expenseTypes = await _expenseTypeService.GetAllAsync();
                var responseData = expenseTypes;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving all expense types");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetById(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "ExpenseType ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving expense type with ID: {ExpenseTypeId}", id);
                var expenseType = await _expenseTypeService.GetByIdAsync(id);
                if (expenseType == null)
                {
                    _logger.LogWarning("ExpenseType not found for ID: {ExpenseTypeId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "ExpenseType not found" });
                }
                var responseData = expenseType;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving expense type with ID: {ExpenseTypeId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] ExpenseType expenseType)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (expenseType == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "ExpenseType data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Creating new expense type");
                var createdId = await _expenseTypeService.CreateAsync(expenseType);
                var responseData = new { ExpenseTypeId = createdId };
                return CreatedAtAction(nameof(GetById), new { id = createdId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error creating expense type");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] ExpenseType expenseType)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "ExpenseType ID cannot be null or empty" });
            }

            if (expenseType == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "ExpenseType data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            // Set ID from URL if missing/empty in body
            if (string.IsNullOrWhiteSpace(expenseType.ExpenseTypeId))
            {
                expenseType.ExpenseTypeId = id;
            }
            else if (id != expenseType.ExpenseTypeId)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "The ID in the URL does not match the entity." });
            }

            try
            {
                _logger.LogInformation("Updating expense type with ID: {ExpenseTypeId}", id);
                var updated = await _expenseTypeService.UpdateAsync(expenseType);
                if (!updated)
                {
                    _logger.LogWarning("ExpenseType not found for update with ID: {ExpenseTypeId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "ExpenseType not found" });
                }
                var responseData = new { message = $"ExpenseType with ID {id} successfully updated", data = expenseType };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error updating expense type with ID: {ExpenseTypeId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Delete(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "ExpenseType ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Deleting expense type with ID: {ExpenseTypeId}", id);
                var deleted = await _expenseTypeService.DeleteAsync(id);
                if (!deleted)
                {
                    _logger.LogWarning("ExpenseType not found for delete with ID: {ExpenseTypeId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "ExpenseType not found" });
                }
                var responseData = new { message = $"ExpenseType with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting expense type with ID: {ExpenseTypeId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}