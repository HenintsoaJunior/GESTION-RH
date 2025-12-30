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
    public class MissionController(IMissionService missionService, ILogger<MissionController> logger)
        : ControllerBase
    {

        [HttpPost("OM")]
        [AllowAnonymous]
        public async Task<IActionResult> GenerateOM([FromBody] GenerateOMDTO generateOM)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }
            if (generateOM == null || string.IsNullOrWhiteSpace(generateOM.MissionId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Les données ou l'identifiant de la mission sont requis." });
            }

            try
            {
                var pdfBytes = await missionService.GenerateMissionOrderPDFAsync(generateOM.EmployeeId, generateOM.MissionId);

                var pdfName = $"OrdreMission-{generateOM.MissionId}-{DateTime.Now:yyyyMMddHHmmss}.pdf";

                return File(pdfBytes, "application/pdf", pdfName);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(new { data = (object?)null, status = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
            }
        }

        [HttpPost("ATH")]
        [AllowAnonymous]
        public async Task<IActionResult> GenerateATH([FromBody] GenerateATHDTO generateOM)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }
            if (generateOM == null || string.IsNullOrWhiteSpace(generateOM.MissionId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Les données ou l'identifiant de la mission sont requis." });
            }

            try
            {
                var pdfBytes = await missionService.GenerateADHAsync(generateOM.EmployeeId, generateOM.MissionId);

                var pdfName = $"AttestationHebergement-{generateOM.MissionId}-{DateTime.Now:yyyyMMddHHmmss}.pdf";

                return File(pdfBytes, "application/pdf", pdfName);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(new { data = (object?)null, status = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
            }
        }

        [HttpPost("ATD")]
        [AllowAnonymous]
        public async Task<IActionResult> GenerateATD([FromBody] GenerateATTDTO generateATD)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var pdfBytes = await missionService.GenerateATDPDFAsync(generateATD.EmployeeId);

                var pdfName = $"OrdreMission-{generateATD.EmployeeId}-{DateTime.Now:yyyyMMddHHmmss}.pdf";

                return File(pdfBytes, "application/pdf", pdfName);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(new { data = (object?)null, status = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
            }
        }

        [HttpPost("IM")]
        [AllowAnonymous]
        public async Task<IActionResult> GenerateIM([FromBody] GenerateOMDTO generateIM)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }
            if (generateIM == null || string.IsNullOrWhiteSpace(generateIM.MissionId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Les données ou l'identifiant de la mission sont requis." });
            }

            try
            {
                var pdfBytes = await missionService.GenerateIMPDFAsync(generateIM.EmployeeId, generateIM.MissionId);

                var pdfName = $"IndemniteMission-{generateIM.MissionId}-{DateTime.Now:yyyyMMddHHmmss}.pdf";

                return File(pdfBytes, "application/pdf", pdfName);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(new { data = (object?)null, status = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
            }
        }

        [HttpGet("total/{employeeId}/{missionId}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetTotalCompensations(string employeeId, string missionId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(employeeId) || string.IsNullOrWhiteSpace(missionId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Les identifiants de l'employé et de la mission sont requis." });
            }

            try
            {
                var total = await missionService.GetTotalCompensationsAsync(employeeId, missionId);
                return Ok(new { data = total, status = 200, message = "success" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { data = (object?)null, status = 500, message = $"Erreur lors du calcul du total : {ex.Message}" });
            }
        }

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
                var entity = await missionService.GetByIdAsync(id);

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

        [HttpPut("{id}/close/{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult> CloseMission(string id, string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "L'id de la mission ne peut pas être null ou vide." });
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "L'userId ne peut pas être null ou vide." });
            }

            try
            {
                var closed = await missionService.CloseAsync(id, userId);
                
                if (closed)
                {
                    logger.LogInformation("Mission {MissionId} clôturée via le contrôleur", id);
                    return Ok(new { 
                        data = (object?)null, 
                        status = 200, 
                        message = $"Mission avec l'ID {id} a été clôturée avec succès." 
                    });
                }

                return NotFound(new { 
                    data = (object?)null, 
                    status = 404, 
                    message = $"Mission avec l'ID {id} non trouvée ou impossible à clôturer." 
                });
            }
            catch (InvalidOperationException ex)
            {
                // Gestion spécifique des erreurs de validation métier
                logger.LogWarning(ex, "Validation échouée pour la clôture de la mission {MissionId}", id);
                return BadRequest(new { 
                    data = (object?)null, 
                    status = 400, 
                    message = ex.Message 
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la clôture de la mission {MissionId}", id);
                return StatusCode(500, new { 
                    data = (object?)null, 
                    status = 500, 
                    message = $"Une erreur est survenue lors de la clôture de la mission: {ex.Message}" 
                });
            }
        }

        [HttpGet("ongoing-with-details")]
        [AllowAnonymous]
        public async Task<ActionResult> GetOngoingMissionsWithDetails()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var missions = await missionService.GetOngoingMissionsWithDetailsAsync();
                var responseData = missions;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération des missions en cours avec détails");
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

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult> Search(
            [FromQuery] MissionSearchFiltersDTO filters,
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            filters ??= new MissionSearchFiltersDTO();

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
                    return Ok(new { data = (object?)null, status = 200, message = $"Mission pour id {id} annulée avec succès." });
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

        [HttpGet("ongoing-count")]
        [AllowAnonymous]
        public async Task<ActionResult> GetOngoingMissionsCount()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var count = await missionService.GetOngoingMissionsCountAsync();
                var responseData = count;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du nombre de missions en cours");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }


        [HttpGet("planned-count")]
        [AllowAnonymous]
        public async Task<ActionResult> GetPlannedMissionsThisMonthCountAsync()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var count = await missionService.GetPlannedMissionsThisMonthCountAsync();
                var responseData = count;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du nombre de missions en cours");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }


        [HttpGet("planned-chart")]
        [AllowAnonymous]
        public async Task<ActionResult> GetPlannedMissionsThisMonthCountWithDateAsync()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var result = await missionService.GetPlannedMissionsThisDateCountWithDateAsync();
                
                var responseData = new { count = result.Item1, date = result.Item2 };
                
                return Ok(new { data = responseData, status = 200, message = "Success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du nombre de missions en cours");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("progress-rate")]
        [AllowAnonymous]
        public async Task<ActionResult> GetProgressRateAsync()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var result = await missionService.GetProgressRateAsync();
                var progressRate = result.progressRate;
                var calculationDate = result.calculationDate;
                var responseData = new { progressRate, calculationDate };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du taux d'avancement des missions");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("types-rate")]
        [AllowAnonymous]
        public async Task<ActionResult> GetMissionTypesRateAsync()
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var result = await missionService.GetMissionTypesRateAsync();
                var nationalRate = result.nationalRate;
                var internationalRate = result.internationalRate;
                var responseData = new { nationalRate, internationalRate };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du taux des types de missions");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}