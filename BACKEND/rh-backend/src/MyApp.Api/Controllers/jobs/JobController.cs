using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.jobs;
using MyApp.Api.Services.jobs;

namespace MyApp.Api.Controllers.jobs
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobController : ControllerBase
    {
        private readonly IJobDescriptionService _descriptionService;

        public JobController(IJobDescriptionService descriptionService)
        {
            _descriptionService = descriptionService;
        }

        [HttpGet("job-description")]
        public async Task<IActionResult> GetAllJobsDescription()
        {
            var list = await _descriptionService.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("job-description/{id}")]
        public async Task<IActionResult> GetJobDescriptionById(string id)
        {
            var item = await _descriptionService.GetByIdAsync(id);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost("job-description/create")]
        public async Task<IActionResult> CreateJobDescription([FromBody] JobDescription job)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            job.DescriptionId = Guid.NewGuid().ToString();
            await _descriptionService.AddAsync(job);
            return CreatedAtAction(nameof(GetJobDescriptionById), new { id = job.DescriptionId }, job);
        }

        [HttpPut("job-description/update/{id}")]
        public async Task<IActionResult> UpdateJobDescription(string id, [FromBody] JobDescription updatedJob)
        {
            if (id != updatedJob.DescriptionId)
                return BadRequest("ID mismatch");

            await _descriptionService.UpdateAsync(updatedJob);
            return NoContent();
        }

        [HttpDelete("job-description/delete/{id}")]
        public async Task<IActionResult> DeleteJobDescription(string id)
        {
            var existing = await _descriptionService.GetByIdAsync(id);
            if (existing == null) return NotFound();

            await _descriptionService.DeleteAsync(id);
            return NoContent();
        }
    }
}
