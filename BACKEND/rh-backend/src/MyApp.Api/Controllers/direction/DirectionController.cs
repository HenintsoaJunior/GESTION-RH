using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.form.direction;
using MyApp.Api.Services.direction;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.direction
{
    [Route("api/[controller]")]
    [ApiController]
    public class DirectionController : ControllerBase
    {
        private readonly IDirectionService _directionService;

        public DirectionController(IDirectionService directionService)
        {
            _directionService = directionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Direction>>> GetAll()
        {
            var directions = await _directionService.GetAllAsync();
            return Ok(directions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Direction>> GetById(string id)
        {
            var direction = await _directionService.GetByIdAsync(id);
            if (direction == null)
            {
                return NotFound();
            }
            return Ok(direction);
        }

        [HttpPost]
        public async Task<ActionResult<Direction>> Add([FromBody] DirectionDTOForm form)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var direction = new Direction
            {
                DirectionName = form.DirectionName,
                Acronym = form.Acronym
            };

            await _directionService.AddAsync(direction);

            return CreatedAtAction(nameof(GetById), new { id = direction.DirectionId }, direction);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Direction direction)
        {
            if (id != direction.DirectionId)
            {
                return BadRequest("ID mismatch");
            }

            var existingDirection = await _directionService.GetByIdAsync(id);
            if (existingDirection == null)
            {
                return NotFound();
            }

            await _directionService.UpdateAsync(direction);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var direction = await _directionService.GetByIdAsync(id);
            if (direction == null)
            {
                return NotFound();
            }

            await _directionService.DeleteAsync(id);
            return NoContent();
        }
    }
}