using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.jobs;
using MyApp.Api.Services.jobs;
using MyApp.Model.form.Jobs;

namespace MyApp.Api.Controllers.jobs
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobDescriptionController(IJobDescriptionService service) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var descriptions = await service.GetAllAsync();
            return Ok(descriptions);
        }

        [HttpPost("search")]
        public async Task<IActionResult> GetAllByCriteria([FromBody] JobDescriptionDTOForm criteria)
        {
            var descriptions = await service.GetAllByCriteriaAsync(criteria);
            return Ok(descriptions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var description = await service.GetByIdAsync(id);
            if (description == null) return NotFound();
            return Ok(description);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] JobDescriptionDTOForm dto)
        {
            var id = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] JobDescriptionDTOForm dto)
        {
            var updated = await service.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await service.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}