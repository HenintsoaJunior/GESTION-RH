using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.mission;
using MyApp.Api.Models.form.lieu;
using MyApp.Api.Models.search.mission;
using MyApp.Api.Services.mission;

namespace MyApp.Api.Controllers.mission
{
    [ApiController]
    [Route("api/[controller]")]
    public class LieuController : ControllerBase
    {
        private readonly ILieuService _lieuService;
        private readonly ILogger<LieuController> _logger;

        // Constructeur avec injection du service lieu et du logger
        public LieuController(ILieuService lieuService, ILogger<LieuController> logger)
        {
            _lieuService = lieuService;
            _logger = logger;
        }

        // Récupère tous les lieux
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Lieu>>> GetAll()
        {
            try
            {
                var lieux = await _lieuService.GetAllAsync();
                return Ok(lieux);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération de tous les lieux");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des lieux");
            }
        }

        // Récupère un lieu par son identifiant
        [HttpGet("{id}")]
        public async Task<ActionResult<Lieu>> GetById(string id)
        {
            try
            {
                var lieu = await _lieuService.GetByIdAsync(id);
                if (lieu == null) return NotFound("Lieu non trouvé");
                return Ok(lieu);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération du lieu {LieuId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du lieu");
            }
        }

        // Crée un nouveau lieu à partir d'un formulaire
        [HttpPost]
        public async Task<ActionResult<object>> Create([FromBody] LieuDTOForm lieu)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var id = await _lieuService.CreateAsync(lieu);
                return Ok(new { id, lieu });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création du lieu");
                return StatusCode(500, "Une erreur est survenue lors de la création du lieu");
            }
        }

        // Met à jour un lieu existant
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Lieu lieu)
        {
            if (id != lieu.LieuId) return BadRequest("L'ID dans l'URL ne correspond pas à l'ID du lieu");
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var updated = await _lieuService.UpdateAsync(lieu);
                if (!updated) return NotFound("Lieu non trouvé");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la mise à jour du lieu {LieuId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du lieu");
            }
        }

        // Supprime un lieu par son identifiant
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var deleted = await _lieuService.DeleteAsync(id);
                if (!deleted) return NotFound("Lieu non trouvé");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la suppression du lieu {LieuId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du lieu");
            }
        }

        // Recherche paginée de lieux avec filtres
        [HttpPost("search")]
        public async Task<ActionResult<object>> Search([FromBody] LieuSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var (results, totalCount) = await _lieuService.SearchAsync(filters, page, pageSize);
                return Ok(new
                {
                    data = results,
                    totalCount,
                    page,
                    pageSize
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la recherche des lieux");
                return StatusCode(500, "Une erreur est survenue lors de la recherche des lieux");
            }
        }
    }
}