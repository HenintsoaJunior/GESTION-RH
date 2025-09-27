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
        public async Task<ActionResult<MissionAssignation>> GetByIdMissionAsync(string id)
        {
            try
            {
                var mission = await missionAssignationService.GetByIdMissionAsync(id);
                if (mission == null) return NotFound();
                return Ok(mission);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de la mission {MissionId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération de la mission");
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

        // Crée une nouvelle mission à partir d'un formulaire
        [HttpPost]
        public async Task<ActionResult<object>> Create([FromBody] MissionDTOForm mission)
        {
            try
            {
                var id = await missionService.CreateAsync(mission);
                return Ok(new { id, mission });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création de la mission");
                return StatusCode(500, "Une erreur est survenue lors de la création de la mission");
            }
        }

        // Met à jour une mission existante
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] MissionDTOForm mission)
        {
            try
            {
                var updated = await missionService.UpdateAsync(id,mission);
                
                return Ok(new { success = updated, mission });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour de la mission {MissionId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour de la mission");
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