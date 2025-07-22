using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.form.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class MissionAssignationController : ControllerBase
    {
        private readonly IMissionAssignationService _service;

        public MissionAssignationController(IMissionAssignationService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{employeeId}/{missionId}")]
        public async Task<IActionResult> GetByKey(string employeeId, string missionId)
        {
            var result = await _service.GetByKeyAsync(employeeId, missionId);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MissionAssignationDTOForm dto)
        {
            await _service.CreateAsync(dto);
            return Ok(new { message = "Assignation enregistrée avec succès." });
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] MissionAssignationDTOForm dto)
        {
            var success = await _service.UpdateAsync(dto);
            if (!success) return NotFound();
            return Ok(new { message = "Assignation mise à jour." });
        }

        [HttpDelete("{employeeId}/{missionId}")]
        public async Task<IActionResult> Delete(string employeeId, string missionId)
        {
            var success = await _service.DeleteAsync(employeeId, missionId);
            if (!success) return NotFound();
            return Ok(new { message = "Assignation supprimée." });
        }
    }
}
