using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.jobs;
using MyApp.Api.Models.form.jobs;
using MyApp.Api.Services.jobs;

namespace MyApp.Api.Controllers.jobs
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobOfferController : ControllerBase
    {
        private readonly IJobOfferService _service;

        public JobOfferController(IJobOfferService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var offers = await _service.GetAllAsync();
            return Ok(offers);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var offer = await _service.GetByIdAsync(id);
            if (offer == null)
                return NotFound();

            return Ok(offer);
        }

        [HttpPost("by-criteria")]
        public async Task<IActionResult> GetAllByCriteria([FromBody] JobOfferDTOForm jobOfferDTOForm)
        {
            var criteria = new JobOffer(jobOfferDTOForm);
            var offers = await _service.GetAllByCriteriaAsync(criteria);
            return Ok(offers);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] JobOffer offer)
        {
            await _service.AddAsync(offer);
            return CreatedAtAction(nameof(GetById), new { id = offer.OfferId }, offer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] JobOffer offer)
        {
            if (id != offer.OfferId)
                return BadRequest("ID mismatch");

            var existing = await _service.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            await _service.UpdateAsync(offer);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            await _service.DeleteAsync(existing);
            return NoContent();
        }
    }
}
