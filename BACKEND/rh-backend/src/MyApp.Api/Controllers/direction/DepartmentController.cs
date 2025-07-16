using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.direction;
using MyApp.Api.Models.form.direction;
using MyApp.Api.Services.direction;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.direction
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly IDepartmentService _departmentService;

        public DepartmentController(IDepartmentService departmentService)
        {
            _departmentService = departmentService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetAll()
        {
            var departments = await _departmentService.GetAllAsync();
            return Ok(departments);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Department>> GetById(string id)
        {
            var department = await _departmentService.GetByIdAsync(id);
            if (department == null)
            {
                return NotFound();
            }
            return Ok(department);
        }

        [HttpPost]
        public async Task<ActionResult<Department>> Add([FromBody] DepartmentDTOForm form)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var department = new Department
            {
                DepartmentName = form.DepartmentName,
                DirectionId = form.DirectionId
            };

            await _departmentService.AddAsync(department);

            return CreatedAtAction(nameof(GetById), new { id = department.DepartmentId }, department);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Department department)
        {
            if (id != department.DepartmentId)
            {
                return BadRequest("ID mismatch");
            }

            var existingDepartment = await _departmentService.GetByIdAsync(id);
            if (existingDepartment == null)
            {
                return NotFound();
            }

            await _departmentService.UpdateAsync(department);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var department = await _departmentService.GetByIdAsync(id);
            if (department == null)
            {
                return NotFound();
            }

            await _departmentService.DeleteAsync(id);
            return NoContent();
        }
    }
}