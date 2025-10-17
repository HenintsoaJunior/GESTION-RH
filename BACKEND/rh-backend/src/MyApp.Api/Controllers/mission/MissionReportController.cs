using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [Route("api/[controller]")]
    [ApiController]
    public class MissionReportController : ControllerBase
    {
        private readonly IMissionReportService _service;
        private readonly ILogger<MissionReportController> _logger;

        public MissionReportController(IMissionReportService service, ILogger<MissionReportController> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        // GET: api/MissionReport/assignation/{assignationId}
        [HttpGet("assignation/{assignationId}")]
        // [AllowAnonymous]
        public async Task<ActionResult> GetByAssignationId(string assignationId)
        {
            // if (!User.Identity?.IsAuthenticated ?? true)
            // {
            //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            // }

            if (string.IsNullOrEmpty(assignationId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Assignation ID cannot be null or empty" });
            }

            try
            {
                var reports = await _service.GetByAssignationIdAsync(assignationId);
                return Ok(new { data = reports, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des rapports par assignation {AssignationId}", assignationId);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // GET: api/MissionReport
        [HttpGet]
        // [AllowAnonymous]
        public async Task<ActionResult> GetAll()
        {
            // if (!User.Identity?.IsAuthenticated ?? true)
            // {
            //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            // }

            try
            {
                var reports = await _service.GetAllAsync();
                return Ok(new { data = reports, status = 200, message = "success" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les rapports de mission.");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // GET: api/MissionReport/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetById(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Mission report ID cannot be null or empty" });
            }

            try
            {
                var report = await _service.GetByIdAsync(id);
                return Ok(new { data = report, status = 200, message = "success" });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Rapport de mission non trouvé avec l'ID {MissionReportId}", id);
                return NotFound(new { data = (object?)null, status = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du rapport de mission {MissionReportId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
        

        // POST: api/MissionReport
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] MissionReportDTOForm? dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Les données du rapport de mission sont invalides" });
            }

            try
            {
                var newId = await _service.CreateAsync(dto);
                var responseData = new { MissionReportId = newId };
                return CreatedAtAction(nameof(GetById), new { id = newId }, new { data = responseData, status = 201, message = "created" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { data = (object?)null, status = 403, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du rapport de mission.");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // PUT: api/MissionReport/{id}
        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] MissionReportDTOForm? dto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Mission report ID cannot be null or empty" });
            }

            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Les données du rapport de mission sont invalides" });
            }

            try
            {
                var updated = await _service.UpdateAsync(id, dto);
                if (!updated)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = $"Rapport de mission {id} non trouvé" });
                }

                var responseData = new { message = $"Rapport de mission {id} mis à jour avec succès" };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { data = (object?)null, status = 403, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { data = (object?)null, status = 404, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du rapport de mission {MissionReportId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // DELETE: api/MissionReport/{id}
        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Delete(string id, [FromQuery] string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrEmpty(id) || string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Mission report ID and User ID are required" });
            }

            try
            {
                var deleted = await _service.DeleteAsync(id, userId);
                if (!deleted)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = $"Rapport de mission {id} non trouvé" });
                }

                var responseData = new { message = $"Rapport de mission {id} supprimé avec succès", data = new { id, userId } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { data = (object?)null, status = 403, message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du rapport de mission {MissionReportId} par l'utilisateur {UserId}", id, userId);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}