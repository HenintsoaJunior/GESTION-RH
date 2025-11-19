using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestMissionController : ControllerBase
    {
        private readonly IMissionService _missionService;
        private readonly ILogger<TestMissionController> _logger;

        public TestMissionController(IMissionService missionService, ILogger<TestMissionController> logger)
        {
            _missionService = missionService ?? throw new ArgumentNullException(nameof(missionService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost("generate-test-batch")]
        public async Task<IActionResult> GenerateTestMissionBatch([FromQuery] int count = 5)
        {
            try
            {
                var createdIds = new List<string>();
                for (int i = 0; i < count; i++)
                {
                    var testMissionDto = new MissionDTOForm
                    {
                        MissionType = "national",
                        Type = "Indemnité",
                        Name = $"Mission de Test Batch {i + 1}",
                        Description = $"Description pour la mission de test batch {i + 1}.",
                        StartDate = DateTime.UtcNow.AddDays(i + 1),
                        EndDate = DateTime.UtcNow.AddDays(i + 5),
                        LieuId = "24",
                        UserId = "ce796eb6-0f7e-4dbc-9c1e-de00f53de186",

                        Assignations = new List<MissionAssignationDTOForm>
                        {
                            new MissionAssignationDTOForm
                            {
                                EmployeeId = "EMP_400",
                                TransportId = null,
                                DepartureDate = DateTime.UtcNow.AddDays(i + 1),
                                DepartureTime = TimeSpan.FromHours(9),
                                ReturnDate = DateTime.UtcNow.AddDays(i + 5),
                                ReturnTime = TimeSpan.FromHours(17),
                                Type = "Indemnité"
                            }
                        }
                    };

                    var missionId = await _missionService.CreateAsync(testMissionDto);
                    if (!string.IsNullOrWhiteSpace(missionId))
                    {
                        createdIds.Add(missionId);
                    }
                    else
                    {
                        _logger.LogWarning("Échec de création pour la mission batch {Index}.", i + 1);
                    }
                }

                return Ok(new { Message = $"Batch de {createdIds.Count} missions de test créées avec succès.", CreatedMissionIds = createdIds });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la génération du batch de missions de test.");
                return StatusCode(500, "Erreur interne lors de la génération du batch.");
            }
        }
    }
}