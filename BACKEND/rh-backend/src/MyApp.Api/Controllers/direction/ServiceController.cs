using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.form.direction;
using MyApp.Api.Services.direction;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.direction
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public ServiceController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Service>>> GetAll()
        {
            var services = await _serviceService.GetAllAsync();
            return Ok(services);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Service>> GetById(string id)
        {
            var service = await _serviceService.GetByIdAsync(id);
            if (service == null)
            {
                return NotFound();
            }
            return Ok(service);
        }

        [HttpPost]
        public async Task<ActionResult<Service>> Add([FromBody] ServiceDTOForm form)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var service = new Service
            {
                ServiceName = form.ServiceName,
                DepartmentId = form.DepartmentId
            };

            await _serviceService.AddAsync(service);

            return CreatedAtAction(nameof(GetById), new { id = service.ServiceId }, service);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Service service)
        {
            if (id != service.ServiceId)
            {
                return BadRequest("ID mismatch");
            }

            var existingService = await _serviceService.GetByIdAsync(id);
            if (existingService == null)
            {
                return NotFound();
            }

            await _serviceService.UpdateAsync(service);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var service = await _serviceService.GetByIdAsync(id);
            if (service == null)
            {
                return NotFound();
            }

            await _serviceService.DeleteAsync(id);
            return NoContent();
        }
    }
}