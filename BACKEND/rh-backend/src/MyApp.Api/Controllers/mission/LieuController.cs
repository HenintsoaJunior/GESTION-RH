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

            try
            {
                var lieu = await lieuService.GetByIdAsync(id);
                if (lieu == null)
                {
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
        public async Task<ActionResult> Create([FromBody] LieuDTOForm lieu)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState.ToString() });
            }

            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var id = await lieuService.CreateAsync(lieu);
                return Ok(new { data = new { id, lieu }, status = 201, message = "created" });
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
            if (id != lieu.LieuId)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "L'ID dans l'URL ne correspond pas à l'ID du lieu" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState.ToString() });
            }

            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var updated = await lieuService.UpdateAsync(lieu);
                if (!updated)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = "Lieu non trouvé" });
                }
                return Ok(new { data = (object?)null, status = 200, message = "updated" });
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

            try
            {
                var deleted = await lieuService.DeleteAsync(id);
                if (!deleted)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = "Lieu non trouvé" });
                }
                return Ok(new { data = (object?)null, status = 200, message = "deleted" });
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
        [HttpPost("search")]
        [AllowAnonymous]
        public async Task<ActionResult> Search([FromBody] LieuSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState.ToString() });
            }

            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            try
            {
                var (results, totalCount) = await lieuService.SearchAsync(filters, page, pageSize);
                return Ok(new { data = results, totalCount, page, pageSize, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                logger.LogError(ex, "Erreur lors de la recherche des lieux");
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la recherche des lieux");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}