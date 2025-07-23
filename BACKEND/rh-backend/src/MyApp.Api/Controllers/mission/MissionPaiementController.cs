using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Services.mission;
using MyApp.Api.Models.form.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class MissionPaiementController : ControllerBase
    {
        private readonly ICompensationScaleService _compensationScaleService;
        private readonly IMissionAssignationService _missionAssignationService;

        public MissionPaiementController(
            ICompensationScaleService compensationScaleService,
            IMissionAssignationService missionAssignationService)
        {
            _compensationScaleService = compensationScaleService ?? throw new ArgumentNullException(nameof(compensationScaleService));
            _missionAssignationService = missionAssignationService ?? throw new ArgumentNullException(nameof(missionAssignationService));
        }

        [HttpPost("generate")]
        public async Task<ActionResult<IEnumerable<MissionPaiement>>> GeneratePaiements([FromBody] GeneratePaiementDTO generatePaiementDTO)
        {
            if (generatePaiementDTO == null || string.IsNullOrWhiteSpace(generatePaiementDTO.EmployeeId) || string.IsNullOrWhiteSpace(generatePaiementDTO.MissionId))
            {
                return BadRequest("Valid EmployeeId and MissionId are required.");
            }

            try
            {
                var missionAssignation =
                    await _missionAssignationService.GeneratePaiementsAsync(generatePaiementDTO.EmployeeId,
                        generatePaiementDTO.MissionId);

                return Ok(missionAssignation);
            }
            catch (Exception ex)
            {
                // Log the exception (logging not shown here, but recommended)
                return StatusCode(500, $"An error occurred while generating payments: {ex.Message}");
            }
        }
    }
}