using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.site;
using MyApp.Api.Services.site;

namespace MyApp.Api.Controllers.site
{
    [ApiController]
    [Route("api/[controller]")]
    public class SiteController(
        ISiteService siteService,
        ILogger<SiteController> logger) // Added ILogger dependency
        : ControllerBase
    {
        // GET: api/site
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Site>>> GetAll()
        {
            try
            {
                var sites = await siteService.GetAllAsync();
                return Ok(sites);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération de tous les sites");
                return StatusCode(500, "Une erreur est survenue lors de la récupération des sites");
            }
        }

        // GET: api/site/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Site>> GetById(string id)
        {
            try
            {
                var site = await siteService.GetByIdAsync(id);
                if (site == null)
                {
                    logger.LogWarning("Site avec ID {SiteId} non trouvé", id);
                    return NotFound();
                }
                return Ok(site);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la récupération du site avec ID {SiteId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la récupération du site");
            }
        }

        // POST: api/site
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Site site)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                await siteService.AddAsync(site);
                return CreatedAtAction(nameof(GetById), new { id = site.SiteId }, site);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la création d'un site");
                return StatusCode(500, "Une erreur est survenue lors de la création du site");
            }
        }

        // PUT: api/site/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] Site site)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != site.SiteId)
                    return BadRequest("L'ID dans l'URL ne correspond pas à l'entité.");

                var existing = await siteService.GetByIdAsync(id);
                if (existing == null)
                {
                    logger.LogWarning("Échec de la mise à jour, site avec ID {SiteId} introuvable", id);
                    return NotFound();
                }

                await siteService.UpdateAsync(site);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la mise à jour du site avec ID {SiteId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la mise à jour du site");
            }
        }

        // DELETE: api/site/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            try
            {
                var site = await siteService.GetByIdAsync(id);
                if (site == null)
                {
                    logger.LogWarning("Échec de suppression, site avec ID {SiteId} introuvable", id);
                    return NotFound();
                }

                await siteService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Erreur lors de la suppression du site avec ID {SiteId}", id);
                return StatusCode(500, "Une erreur est survenue lors de la suppression du site");
            }
        }
    }
}