using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.jobs;
using MyApp.Api.Services.jobs;
using MyApp.Model.form.Jobs;

namespace MyApp.Api.Controllers.jobs
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobDescriptionController : ControllerBase
    {
        private readonly IJobDescriptionService _service;

        public JobDescriptionController(IJobDescriptionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<JobDescription>>> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JobDescription>> GetById(string id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
                return NotFound();
            return Ok(result);
        }


        [HttpPost("by-criteria")]
        public async Task<ActionResult<IEnumerable<JobDescription>>> GetByCriteria([FromBody] JobDescription criteria)
        {
            var result = await _service.GetAllByCriteriaAsync(criteria);
            return Ok(result);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] JobDescriptionDTOForm jobDescriptionDTOForm)
        {
            var jobDescription = new JobDescription(jobDescriptionDTOForm);
            await _service.AddAsync(jobDescription);
            return CreatedAtAction(nameof(GetById), new { id = jobDescription.DescriptionId }, jobDescription);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] JobDescription jobDescription)
        {
            if (id != jobDescription.DescriptionId)
                return BadRequest("ID mismatch.");

            await _service.UpdateAsync(jobDescription);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var existing = await _service.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            await _service.DeleteAsync(existing);
            return NoContent();
        }
    }
}
