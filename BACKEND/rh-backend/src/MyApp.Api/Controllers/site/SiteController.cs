using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.site;
using MyApp.Api.Models.dto.site;
using MyApp.Api.Services.site;

namespace MyApp.Api.Controllers.site
{
    [ApiController]
    [Route("api/[controller]")]
    public class SiteController : ControllerBase
    {
        private readonly ISiteService _siteService;
        private readonly ILogger<SiteController> _logger;

        public SiteController(ISiteService siteService, ILogger<SiteController> logger)
        {
            _siteService = siteService ?? throw new ArgumentNullException(nameof(siteService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // GET: api/site
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
                var sites = await _siteService.GetAllAsync();
                var responseData = sites;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la récupération de tous les sites");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // GET: api/site/{id}
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
                return BadRequest(new { data = (object?)null, status = 400, message = "Site ID cannot be null or empty" });
            }

            try
            {
                var site = await _siteService.GetByIdAsync(id);
                if (site == null)
                {
                    _logger.LogWarning("Site avec ID {SiteId} non trouvé", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Site not found" });
                }
                var responseData = site;
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la récupération du site avec ID {SiteId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // POST: api/site
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> Create([FromBody] CreateSiteDTO createDto)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (createDto == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Site data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            try
            {
                var createdSite = await _siteService.AddAsync(createDto);
                var responseData = new { SiteId = createdSite.SiteId };
                return CreatedAtAction(nameof(GetById), new { id = createdSite.SiteId }, new { data = responseData, status = 201, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la création d'un site");
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // PUT: api/site/{id}
        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Update(string id, [FromBody] Site site)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Site ID cannot be null or empty" });
            }

            if (site == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Site data cannot be null" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ModelState });
            }

            if (id != site.SiteId)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "L'ID dans l'URL ne correspond pas à l'entité." });
            }

            try
            {
                var existing = await _siteService.GetByIdAsync(id);
                if (existing == null)
                {
                    _logger.LogWarning("Échec de la mise à jour, site avec ID {SiteId} introuvable", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Site not found" });
                }

                await _siteService.UpdateAsync(site);
                var responseData = new { message = $"Site with ID {id} successfully updated", data = site };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la mise à jour du site avec ID {SiteId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        // DELETE: api/site/{id}
        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult> Delete(string id)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrEmpty(id))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Site ID cannot be null or empty" });
            }

            try
            {
                var site = await _siteService.GetByIdAsync(id);
                if (site == null)
                {
                    _logger.LogWarning("Échec de suppression, site avec ID {SiteId} introuvable", id);
                    return NotFound(new { data = (object?)null, status = 404, message = "Site not found" });
                }

                await _siteService.DeleteAsync(id);
                var responseData = new { message = $"Site with ID {id} successfully deleted", data = new { id } };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Erreur lors de la suppression du site avec ID {SiteId}", id);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}