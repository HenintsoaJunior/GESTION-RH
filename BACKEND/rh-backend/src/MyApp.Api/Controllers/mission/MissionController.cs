using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.search.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MissionController : ControllerBase
    {
        private readonly IMissionService _missionService;
        private readonly ILogger<MissionController> _logger;

        public MissionController(IMissionService missionService, ILogger<MissionController> logger)
        {
            _missionService = missionService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Mission>>> GetAll()
        {
            var missions = await _missionService.GetAllAsync();
            return Ok(missions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Mission>> GetById(string id)
        {
            var mission = await _missionService.GetByIdAsync(id);
            if (mission == null) return NotFound();
            return Ok(mission);
        }

        [HttpPost]
        public async Task<ActionResult<string>> Create([FromBody] Mission mission)
        {
            var id = await _missionService.CreateAsync(mission);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Mission mission)
        {
            if (id != mission.MissionId) return BadRequest("ID mismatch");

            var updated = await _missionService.UpdateAsync(mission);
            if (!updated) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _missionService.DeleteAsync(id);
            if (!deleted) return NotFound();

            return NoContent();
        }

        [HttpPost("search")]
        public async Task<ActionResult<object>> Search([FromBody] MissionSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var (results, totalCount) = await _missionService.SearchAsync(filters, page, pageSize);
            return Ok(new
            {
                data = results,
                totalCount,
                page,
                pageSize
            });
        }
    }
}
