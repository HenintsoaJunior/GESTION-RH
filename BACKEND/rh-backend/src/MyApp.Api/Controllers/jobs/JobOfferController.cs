using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.jobs;
using MyApp.Api.Models.dto.jobs;
using MyApp.Api.Services.jobs;

namespace MyApp.Api.Controllers.jobs
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobOfferController(IJobOfferService service) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var offers = await service.GetAllAsync();
            return Ok(offers);
        }

        [HttpPost("search")]
        public async Task<IActionResult> GetAllByCriteria([FromBody] JobOfferDTOForm criteria)
        {
            var offers = await service.GetAllByCriteriaAsync(criteria);
            return Ok(offers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var offer = await service.GetByIdAsync(id);
            if (offer == null) return NotFound();
            return Ok(offer);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] JobOfferDTOForm dto)
        {
            var id = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] JobOfferDTOForm dto)
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