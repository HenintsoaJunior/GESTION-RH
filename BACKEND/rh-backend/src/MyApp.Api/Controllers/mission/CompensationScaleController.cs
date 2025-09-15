using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompensationScaleController(
        ICompensationScaleService service,
        ILogger<CompensationScaleController> logger)
        : ControllerBase
    {
        private readonly ICompensationScaleService _service = service ?? throw new ArgumentNullException(nameof(service));
        private readonly ILogger<CompensationScaleController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var results = await _service.GetAllAsync();
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetAll CompensationScale");
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var result = await _service.GetByIdAsync(id);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetById CompensationScale avec id={Id}", id);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByEmployeeCategory(string categoryId)
        {
            try
            {
                var results = await _service.GetByEmployeeCategoryAsync(categoryId);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetByEmployeeCategory CompensationScale avec categoryId={CategoryId}", categoryId);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        [HttpPost("search")]
        public async Task<IActionResult> GetByCriteria([FromBody] CompensationScaleDTOForm criteria)
        {
            try
            {
                var results = await _service.GetByCriteriaAsync(criteria);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de GetByCriteria CompensationScale");
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CompensationScaleDTOForm dto)
        {
            try
            {
                var id = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id }, new { id });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de Create CompensationScale");
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] CompensationScaleDTOForm dto)
        {
            try
            {
                var success = await _service.UpdateAsync(id, dto);
                if (!success) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de Update CompensationScale avec id={Id}", id);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id, [FromQuery] string userId)
        {
            try
            {
                var success = await _service.DeleteAsync(id, userId);
                if (!success) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de Delete CompensationScale avec id={Id}", id);
                return StatusCode(500, "Erreur interne du serveur");
            }
        }
    }
}
