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
    public class MissionController(IMissionService missionService, IMissionAssignationService missionAssignationService, ILogger<MissionController> logger)
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
                    var responseData = mission;
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
        [AllowAnonymous]
        public async Task<ActionResult> GetAll()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var missions = await missionService.GetAllAsync();
                var responseData = missions;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de toutes les missions");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
        
        // Supprime une mission par son identifiant
        [HttpDelete("{id}/{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult> Delete(string id, string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "L'id ne peut pas être null ou vide." });
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "L'userId ne peut pas être null ou vide." });
            }

            try
            {
                var deleted = await missionService.DeleteAsync(id, userId);
                if (deleted)
                {
                    return Ok(new { data = (object?)null, status = 200, message = $"Mission pour id {id} supprimée avec succès." });
                }

                return NotFound(new { data = (object?)null, status = 404, message = $"Mission pour id {id} non trouvée." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression de la mission {MissionId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // Recherche paginée de missions avec filtres
        [HttpPost("search")]
        [AllowAnonymous]
        public async Task<ActionResult> Search([FromBody] MissionSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (filters == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Les filtres ne peuvent pas être null." });
            }

            try
            {
                var (results, totalCount) = await missionService.SearchAsync(filters, page, pageSize);
                var responseData = new { results, totalCount, page, pageSize };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la recherche des missions");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // Récupère des statistiques sur les missions
        [HttpGet("stats")]
        [AllowAnonymous]
        public async Task<ActionResult> GetStatistics([FromQuery] string[]? matricule = null)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var stats = await missionService.GetStatisticsAsync(matricule);
                var responseData = stats;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des statistiques des missions avec filtre matricule: {Matricule}", matricule != null ? string.Join(", ", matricule) : "aucun");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
        // Annule une mission (change son statut à "Annulé")
        [HttpPut("{id}/cancel/{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult> CancelMission(string id, string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "L'id ne peut pas être null ou vide." });
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "L'userId ne peut pas être null ou vide." });
            }

            try
            {
                var cancelled = await missionService.CancelAsync(id, userId);
                if (cancelled)
                {
                    logger.LogInformation("Mission {MissionId} annulée via le contrôleur", id);
                    return Ok(new { data = (object?)null, status = 200, message = "success" });
                }

                return NotFound(new { data = (object?)null, status = 404, message = "errors" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de l'annulation de la mission {MissionId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}