using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.employee;
using MyApp.Api.Services.employe;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.employee
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Employee>>> GetAll()
        {
            var employees = await _employeeService.GetAllAsync();
            return Ok(employees);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Employee>> GetById(string id)
        {
            var employee = await _employeeService.GetByIdAsync(id);
            if (employee == null)
            {
                return NotFound();
            }
            return Ok(employee);
        }

        [HttpGet("gender/{genderId}")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetByGender(string genderId)
        {
            var employees = await _employeeService.GetByGenderAsync(genderId);
            return Ok(employees);
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<IEnumerable<Employee>>> GetByStatus(string status)
        {
            var employees = await _employeeService.GetByStatusAsync(status);
            return Ok(employees);
        }

        [HttpPost]
        public async Task<ActionResult<Employee>> Create(Employee employee)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _employeeService.AddAsync(employee);
            return CreatedAtAction(nameof(GetById), new { id = employee.EmployeeId }, employee);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, Employee employee)
        {
            if (id != employee.EmployeeId)
            {
                return BadRequest("ID mismatch");
            }

            var existingEmployee = await _employeeService.GetByIdAsync(id);
            if (existingEmployee == null)
            {
                return NotFound();
            }

            await _employeeService.UpdateAsync(employee);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var employee = await _employeeService.GetByIdAsync(id);
            if (employee == null)
            {
                return NotFound();
            }

            await _employeeService.DeleteAsync(id);
            return NoContent();
        }
    }
}