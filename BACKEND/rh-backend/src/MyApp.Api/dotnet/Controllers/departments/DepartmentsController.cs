using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Models.departments;
using MyApp.Api.Services.departments;

namespace MyApp.Api.Controllers.departments
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _service;

        public DepartmentsController(IDepartmentService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var departments = await _service.GetAllAsync();
                return Ok(departments);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while retrieving departments.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            try
            {
                var department = await _service.GetByIdAsync(id);
                return department == null ? NotFound() : Ok(department);
            }
            catch (Exception)
            {
                return StatusCode(500, $"An error occurred while retrieving department with ID {id}.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DepartmentDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(Get), new { id = created.DepartmentId }, created);
            }
            catch (DbUpdateException)
            {
                return BadRequest("A department with this ID already exists.");
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while creating the department.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] DepartmentDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                var updated = await _service.UpdateAsync(id, dto);
                return updated == null ? NotFound() : NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, $"An error occurred while updating department with ID {id}.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);
                return deleted ? NoContent() : NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, $"An error occurred while deleting department with ID {id}.");
            }
        }
    }
}