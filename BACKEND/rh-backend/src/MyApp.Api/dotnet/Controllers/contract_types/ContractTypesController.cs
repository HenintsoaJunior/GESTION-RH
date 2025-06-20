using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models.contract_types;
using MyApp.Api.Services.contract_types;

namespace MyApp.Api.Controllers.contract_types
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContractTypesController : ControllerBase
    {
        private readonly IContractTypeService _service;

        public ContractTypesController(IContractTypeService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var contractTypes = await _service.GetAllAsync();
                return Ok(contractTypes);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while retrieving contract types.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            try
            {
                var contractType = await _service.GetByIdAsync(id);
                return contractType == null ? NotFound() : Ok(contractType);
            }
            catch (Exception)
            {
                return StatusCode(500, $"An error occurred while retrieving contract type with ID {id}.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ContractTypeDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(Get), new { id = created.ContractTypeId }, created);
            }
            catch (DbUpdateException)
            {
                return BadRequest("A contract type with this ID already exists.");
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while creating the contract type.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ContractTypeDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var updated = await _service.UpdateAsync(id, dto);
                return updated == null ? NotFound() : NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, $"An error occurred while updating contract type with ID {id}.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);
                return deleted ? NoContent() : NotFound();
            }
            catch (Exception)
            {
                return StatusCode(500, $"An error occurred while deleting contract type with ID {id}.");
            }
        }
    }
}