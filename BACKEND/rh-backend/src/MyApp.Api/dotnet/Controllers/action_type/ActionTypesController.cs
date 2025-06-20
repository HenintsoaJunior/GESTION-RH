using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models.action_type;
using MyApp.Api.Services.action_type;

namespace MyApp.Api.Controllers.action_type
{
    [Route("api/[controller]")]
    [ApiController]
    public class ActionTypesController : ControllerBase
    {
        private readonly IActionTypeService _service;

        public ActionTypesController(IActionTypeService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var actionTypes = await _service.GetAllAsync();
                return Ok(actionTypes);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while retrieving action types.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            try
            {
                var actionType = await _service.GetByIdAsync(id);
                return actionType == null ? NotFound() : Ok(actionType);
            }
            catch (Exception)
            {
                return StatusCode(500, $"An error occurred while retrieving action type with ID {id}.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ActionTypeDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(Get), new { id = created.ActionTypeId }, created);
            }
            catch (DbUpdateException)
            {
                return BadRequest("An action type with this ID already exists.");
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while creating the action type.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] ActionTypeDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var updated = await _service.UpdateAsync(id, dto);
                return updated == null ? NotFound() : NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, $"An error occurred while updating action type with ID {id}.");
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
                return StatusCode(500, $"An error occurred while deleting action type with ID {id}.");
            }
        }
    }
}