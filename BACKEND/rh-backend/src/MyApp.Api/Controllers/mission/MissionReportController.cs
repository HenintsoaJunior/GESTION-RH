using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class MissionReportController : ControllerBase
    {
        private readonly IMissionReportService _service;
        private readonly ILogger<MissionReportController> _logger;

        public MissionReportController(IMissionReportService service, ILogger<MissionReportController> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // GET: api/MissionReport
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MissionReport>>> GetAll()
        {
            var reports = await _service.GetAllAsync();
            return Ok(reports);
        }

        // GET: api/MissionReport/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<MissionReport>> GetById(string id)
        {
            try
            {
                var report = await _service.GetByIdAsync(id);
                return Ok(report);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Rapport de mission non trouvé avec l'ID {MissionReportId}", id);
                return NotFound(new { message = ex.Message });
            }
        }

        // GET: api/MissionReport/assignation/{assignationId}
        [HttpGet("assignation/{assignationId}")]
        public async Task<ActionResult<IEnumerable<MissionReport>>> GetByAssignationId(string assignationId)
        {
            var reports = await _service.GetByAssignationIdAsync(assignationId);
            return Ok(reports);
        }

        // POST: api/MissionReport
        [HttpPost]
        public async Task<ActionResult<string>> Create([FromBody] MissionReportDTOForm? dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Les données du rapport de mission sont invalides" });

            var newId = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = newId }, new { MissionReportId = newId });
        }

        // PUT: api/MissionReport/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] MissionReportDTOForm? dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Les données du rapport de mission sont invalides" });

            var updated = await _service.UpdateAsync(id, dto);
            if (!updated) return NotFound(new { message = $"Rapport de mission {id} non trouvé" });

            return NoContent();
        }

        // DELETE: api/MissionReport/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id, [FromQuery] string userId)
        {
            var deleted = await _service.DeleteAsync(id, userId);
            if (!deleted) return NotFound(new { message = $"Rapport de mission {id} non trouvé" });

            return NoContent();
        }
    }
}
