using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.dto.lieu;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class LieuController(ILieuService lieuService, ILogger<LieuController> logger) : ControllerBase
    {
        // Constructeur avec injection du service lieu et du logger

        // Récupère tous les lieux
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
                var lieux = await lieuService.GetAllAsync();
                return Ok(new { data = lieux, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de tous les lieux");
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                logger.LogError(e, "Erreur lors de la récupération de tous les lieux");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // Récupère un lieu par son identifiant
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetById(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Lieu ID cannot be null or empty" });
            }

            try
            {
                var lieu = await lieuService.GetByIdAsync(id);
                if (lieu == null)
                {
                    logger.LogWarning("Lieu not found for ID: {LieuId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Lieu non trouvé" });
                }
                return Ok(new { data = lieu, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du lieu {LieuId}", id);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du lieu {LieuId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // Crée un nouveau lieu à partir d'un formulaire
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] LieuDTOForm dto)
        {
            if (dto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Lieu data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                logger.LogInformation("Creating new lieu");
                var createdId = await lieuService.CreateAsync(dto);
                var responseData = new { LieuId = createdId };
                return CreatedAtAction(nameof(GetById), new { id = createdId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la création du lieu");
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création du lieu");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // Met à jour un lieu existant
        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] Lieu lieu)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Lieu ID cannot be null or empty" });
            }

            if (lieu == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Lieu data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            if (id != lieu.LieuId)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "The ID in the URL does not match the entity." });
            }

            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                logger.LogInformation("Updating lieu with ID: {LieuId}", id);
                var updated = await lieuService.UpdateAsync(lieu);
                if (!updated)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = "Lieu non trouvé" });
                }
                var responseData = new { message = $"Lieu with ID {id} successfully updated", data = lieu };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour du lieu {LieuId}", id);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour du lieu {LieuId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // Supprime un lieu par son identifiant
        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Delete(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Lieu ID cannot be null or empty" });
            }

            try
            {
                logger.LogInformation("Deleting lieu with ID: {LieuId}", id);
                var lieu = await lieuService.GetByIdAsync(id);
                if (lieu == null)
                {
                    logger.LogWarning("Lieu not found for ID: {LieuId}", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Lieu non trouvé" });
                }

                var deleted = await lieuService.DeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = "Lieu non trouvé" });
                }
                var responseData = new { message = $"Lieu with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression du lieu {LieuId}", id);
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression du lieu {LieuId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // Recherche paginée de lieux avec filtres
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<ActionResult<object>> Search([FromQuery] string? nom, [FromQuery] string? ville, [FromQuery] string? pays, [FromQuery] string? zoneId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var filters = new LieuSearchFiltersDTO { Nom = nom, Ville = ville, Pays = pays, ZoneId = zoneId };
            var (results, totalCount) = await lieuService.SearchAsync(filters, page, pageSize);
            return Ok(new
            {
                data = results,
                totalCount,
                page,
                pageSize
            });
        }
    }
}