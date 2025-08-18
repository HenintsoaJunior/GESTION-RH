using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.application;
using MyApp.Api.Models.form.application;
using MyApp.Api.Services.application;

namespace MyApp.Api.Controllers.application
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationsController : ControllerBase
    {
        private readonly IApplicationService _service;
        private readonly ILogger<ApplicationsController> _logger;

        public ApplicationsController(IApplicationService service, ILogger<ApplicationsController> logger)
        {
            _service = service;
            _logger = logger;
        }

        // GET: api/applications
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Application>>> GetAll()
        {
            var applications = await _service.GetAllAsync();
            return Ok(applications);
        }

        // POST: api/applications/search
        [HttpPost("search")]
        public async Task<ActionResult<IEnumerable<Application>>> GetAllByCriteria([FromBody] ApplicationDTOForm criteria)
        {
            var results = await _service.GetAllByCriteriaAsync(criteria);
            return Ok(results);
        }

        // GET: api/applications/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Application>> GetById(string id)
        {
            var application = await _service.GetByIdAsync(id);
            if (application == null)
            {
                _logger.LogWarning("Application avec ID {ApplicationId} non trouvée", id);
                return NotFound();
            }
            return Ok(application);
        }

        // POST: api/applications
        [HttpPost]
        public async Task<ActionResult<string>> Create([FromBody] ApplicationDTOForm dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var id = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }

        // PUT: api/applications/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<Application>> Update(string id, [FromBody] ApplicationDTOForm dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedEntity = await _service.UpdateAsync(id, dto);
            if (updatedEntity == null)
            {
                _logger.LogWarning("Échec de la mise à jour, application avec ID {ApplicationId} introuvable", id);
                return NotFound();
            }

            return Ok(updatedEntity);
        }

        // DELETE: api/applications/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var success = await _service.DeleteAsync(id);
            if (!success)
            {
                _logger.LogWarning("Échec de suppression, application avec ID {ApplicationId} introuvable", id);
                return NotFound();
            }

            return NoContent();
        }
    }
}
