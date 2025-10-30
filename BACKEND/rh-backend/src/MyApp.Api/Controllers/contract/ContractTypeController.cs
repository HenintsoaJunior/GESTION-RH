using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.contract;
using MyApp.Api.Models.dto.contract;
using MyApp.Api.Services.contract;

namespace MyApp.Api.Controllers.contract
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractTypeController : ControllerBase
    {
        private readonly IContractTypeService _contractTypeService;
        private readonly ILogger<ContractTypeController> _logger;

        public ContractTypeController(IContractTypeService contractTypeService, ILogger<ContractTypeController> logger)
        {
            _contractTypeService = contractTypeService ?? throw new ArgumentNullException(nameof(contractTypeService));
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
                _logger.LogInformation("Retrieving all contract types");
                var contractTypes = await _contractTypeService.GetAllAsync();
                var responseData = contractTypes;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving all contract types");
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Contract Type ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Retrieving contract type with ID: {ContractTypeId}", id);
                var contractType = await _contractTypeService.GetByIdAsync(id);
                if (contractType == null)
                {
                    _logger.LogWarning("Contract Type not found for ID: {ContractTypeId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Contract Type not found" });
                }
                var responseData = contractType;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error retrieving contract type with ID: {ContractTypeId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] CreateContractTypeDTO dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Contract Type data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                _logger.LogInformation("Creating new contract type");
                var createdContractType = await _contractTypeService.AddAsync(dto);
                var responseData = new { ContractTypeId = createdContractType.ContractTypeId };
                return CreatedAtAction(nameof(GetById), new { id = createdContractType.ContractTypeId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error creating contract type");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] ContractType contractType)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Contract Type ID cannot be null or empty" });
            }

            if (contractType == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Contract Type data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            if (id != contractType.ContractTypeId)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "The ID in the URL does not match the entity." });
            }

            try
            {
                _logger.LogInformation("Updating contract type with ID: {ContractTypeId}", id);
                await _contractTypeService.UpdateAsync(contractType);
                var responseData = new { message = $"Contract Type with ID {id} successfully updated", data = contractType };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error updating contract type with ID: {ContractTypeId}", id);
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Contract Type ID cannot be null or empty" });
            }

            try
            {
                _logger.LogInformation("Deleting contract type with ID: {ContractTypeId}", id);
                var contractType = await _contractTypeService.GetByIdAsync(id);
                if (contractType == null)
                {
                    _logger.LogWarning("Contract Type not found for ID: {ContractTypeId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Contract Type not found" });
                }

                await _contractTypeService.DeleteAsync(id);
                var responseData = new { message = $"Contract Type with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error deleting contract type with ID: {ContractTypeId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}