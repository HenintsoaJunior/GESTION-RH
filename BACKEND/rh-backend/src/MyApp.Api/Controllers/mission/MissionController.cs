using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Models.list.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class MissionController(IMissionService missionService,IMissionAssignationService missionAssignationService, ILogger<MissionController> logger)
        : ControllerBase
    {

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetByIdMissionAsync(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "L'id ne peut pas être null ou vide." });
            }

            try
            {
                var entity = await missionAssignationService.GetByIdMissionAsync(id);

                if (entity != null)
                {
                    var responseData = entity;
                    return Ok(new { data = responseData, status = 200, message = "success" });
                }

                return NotFound(new { data = (object?)null, status = 404, message = $"Mission assignation pour id {id} non trouvée." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la récupération de la mission {MissionId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }


        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] MissionDTOForm mission)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (mission == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "La mission ne peut pas être null." });
            }

            try
            {
                var id = await missionService.CreateAsync(mission);
                var responseData = new { id, mission };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la création de la mission");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // Met à jour une mission existante
        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] MissionDTOForm mission)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "L'id ne peut pas être null ou vide." });
            }

            if (mission == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "La mission ne peut pas être null." });
            }

            try
            {
                var updated = await missionService.UpdateAsync(id, mission);

                if (updated)
                {
                    var responseData = new { success = updated, mission };
                    return Ok(new { data = responseData, status = 200, message = "success" });
                }

                return NotFound(new { data = (object?)null, status = 404, message = $"Mission pour id {id} non trouvée." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la mise à jour de la mission {MissionId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Mission>>> GetAll()
        {
            try
            {
                var missions = await missionService.GetAllAsync();
                return Ok(missions);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de toutes les missions");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des missions");
            }
        }
        
        // Supprime une mission par son identifiant
        [HttpDelete("{id}/{userId}")]
        public async Task<IActionResult> Delete(string id, string userId)
        {
            try
            {
                var deleted = await missionService.DeleteAsync(id, userId);
                if (!deleted) return NotFound();
                return Ok(new { message = $"Mission with ID {id} successfully deleted" });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression de la mission {MissionId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression de la mission");
            }
        }

        // Recherche paginée de missions avec filtres
        [HttpPost("search")]
        public async Task<ActionResult<object>> Search([FromBody] MissionSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var (results, totalCount) = await missionService.SearchAsync(filters, page, pageSize);
            return Ok(new
            {
                data = results,
                totalCount,
                page,
                pageSize
            });
        }

        // Récupère des statistiques sur les missions
        [HttpGet("stats")]
        // [Authorize(Roles = "admin")]
        public async Task<ActionResult<MissionStats>> GetStatistics([FromQuery] string[]? matricule = null)
        {
            try
            {
                var stats = await missionService.GetStatisticsAsync(matricule);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error retrieving mission statistics with matricule filter: {Matricule}", matricule != null ? string.Join(", ", matricule) : "none");
                return StatusCode(500, "An error occurred while retrieving mission statistics.");
            }
        }
        // Annule une mission (change son statut à "Annulé")
        [HttpPut("{id}/cancel/{userId}")]
        public async Task<IActionResult> CancelMission(string id, string userId)
        {
            var cancelled = await missionService.CancelAsync(id, userId);
            if (!cancelled) 
            {
                return NotFound(new { error = $"Mission with ID {id} not found" });
            }
            logger.LogInformation("Mission {MissionId} cancelled via controller", id);
            return Ok(new { message = $"Mission with ID {id} successfully cancelled" });
        }
    }
}