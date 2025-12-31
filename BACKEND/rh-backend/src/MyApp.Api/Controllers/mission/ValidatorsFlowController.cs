using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.validatorsflow;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [Route("api/[controller]")]
    [ApiController]
    public class ValidatorsFlowController : ControllerBase
    {
        private readonly IValidatorsFlowService _validatorsFlowService;
        private readonly ILogger<ValidatorsFlowController> _logger;

        public ValidatorsFlowController(IValidatorsFlowService validatorsFlowService, ILogger<ValidatorsFlowController> logger)
        {
            _validatorsFlowService = validatorsFlowService ?? throw new ArgumentNullException(nameof(validatorsFlowService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet]
        // [AllowAnonymous]
        public async Task<ActionResult> GetAll()
        {
            // if (!User.Identity?.IsAuthenticated ?? true)
            // {
            //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            // }

            try
            {
                _logger.LogInformation("Retrieving all validators flows");
                var validatorsFlows = await _validatorsFlowService.GetAllAsync();
                var responseData = validatorsFlows;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving all validators flows");
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Validator ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving validator flow with ID: {ValidatorId}", id);
                var validatorFlow = await _validatorsFlowService.GetByIdAsync(id);
                if (validatorFlow == null)
                {
                    _logger.LogWarning("Validator flow not found for ID: {ValidatorId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Validator flow not found" });
                }
                var responseData = validatorFlow;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving validator flow with ID: {ValidatorId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("user/{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetByUserId(string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "User ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving validator flows for user ID: {UserId}", userId);
                var validatorFlows = await _validatorsFlowService.GetByUserIdAsync(userId);
                var responseData = validatorFlows;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving validator flows for user ID: {UserId}", userId);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("type/{validatorType}/user/{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetByTypeAndUser(string validatorType, string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(validatorType))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Validator type cannot be null or empty" });
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "User ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving validator flows of type {ValidatorType} for user ID: {UserId}", validatorType, userId);
                var validatorFlows = await _validatorsFlowService.GetByTypeAndUserAsync(validatorType, userId);
                var responseData = validatorFlows;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving validator flows of type {ValidatorType} for user ID: {UserId}", validatorType, userId);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("type/{validatorType}/superior/{superiorId}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetByTypeAndSuperior(string validatorType, string superiorId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(validatorType))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Validator type cannot be null or empty" });
            }

            if (string.IsNullOrWhiteSpace(superiorId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Superior ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving validator flows of type {ValidatorType} for superior ID: {SuperiorId}", validatorType, superiorId);
                var validatorFlows = await _validatorsFlowService.GetByTypeAndSuperiorAsync(validatorType, superiorId);
                var responseData = validatorFlows;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving validator flows of type {ValidatorType} for superior ID: {SuperiorId}", validatorType, superiorId);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("type/{validatorType}/backup-order/{backupOrder}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetByTypeAndBackupOrder(string validatorType, int backupOrder)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(validatorType))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Validator type cannot be null or empty" });
            }

            if (backupOrder < 0)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Backup order cannot be negative" });
            }

            try
            {
                _logger.LogInformation("Retrieving validator flows of type {ValidatorType} with backup order: {BackupOrder}", validatorType, backupOrder);
                var validatorFlows = await _validatorsFlowService.GetByTypeAndBackupOrderAsync(validatorType, backupOrder);
                var responseData = validatorFlows;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving validator flows of type {ValidatorType} with backup order: {BackupOrder}", validatorType, backupOrder);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] ValidatorsFlowDTOForm dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Validator flow data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Creating new validator flow");
                var createdValidatorFlow = await _validatorsFlowService.AddAsync(dto);
                var responseData = new { ValidatorId = createdValidatorFlow.ValidatorId };
                return CreatedAtAction(nameof(GetById), new { id = createdValidatorFlow.ValidatorId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error creating validator flow");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] ValidatorsFlow validatorFlow)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Validator ID cannot be null or empty" });
            }

            if (validatorFlow == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Validator flow data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            if (id != validatorFlow.ValidatorId)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "The ID in the URL does not match the entity." });
            }

            try
            {
                _logger.LogInformation("Updating validator flow with ID: {ValidatorId}", id);
                await _validatorsFlowService.UpdateAsync(validatorFlow);
                var responseData = new { message = $"Validator flow with ID {id} successfully updated", data = validatorFlow };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error updating validator flow with ID: {ValidatorId}", id);
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Validator ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Deleting validator flow with ID: {ValidatorId}", id);
                var validatorFlow = await _validatorsFlowService.GetByIdAsync(id);
                if (validatorFlow == null)
                {
                    _logger.LogWarning("Validator flow not found for ID: {ValidatorId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Validator flow not found" });
                }

                await _validatorsFlowService.DeleteAsync(id);
                var responseData = new { message = $"Validator flow with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting validator flow with ID: {ValidatorId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpDelete("user/{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult> DeleteByUserId(string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "User ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Deleting all validator flows for user ID: {UserId}", userId);
                await _validatorsFlowService.DeleteByUserIdAsync(userId);
                var responseData = new { message = $"All validator flows for user ID {userId} successfully deleted", data = new { userId } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting validator flows for user ID: {UserId}", userId);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}