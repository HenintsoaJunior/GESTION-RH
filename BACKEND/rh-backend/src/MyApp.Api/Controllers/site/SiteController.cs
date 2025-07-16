using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.site;
using MyApp.Api.Services.site;

namespace MyApp.Api.Controllers.site
{
    [ApiController]
    [Route("api/[controller]")]
    public class SiteController : ControllerBase
    {
        private readonly ISiteService _siteService;

        public SiteController(ISiteService siteService)
        {
            _siteService = siteService;
        }

        // GET: api/site
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Site>>> GetAll()
        {
            var sites = await _siteService.GetAllAsync();
            return Ok(sites);
        }

        // GET: api/site/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Site>> GetById(string id)
        {
            var site = await _siteService.GetByIdAsync(id);
            if (site == null)
            {
                return NotFound();
            }
            return Ok(site);
        }

        // POST: api/site
        [HttpPost]
        public async Task<ActionResult> Create([FromBody] Site site)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _siteService.AddAsync(site);
            return CreatedAtAction(nameof(GetById), new { id = site.SiteId }, site);
        }

        // PUT: api/site/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] Site site)
        {
            if (id != site.SiteId)
                return BadRequest("L'ID dans l'URL ne correspond pas à l'entité.");

            var existing = await _siteService.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            await _siteService.UpdateAsync(site);
            return NoContent();
        }

        // DELETE: api/site/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var site = await _siteService.GetByIdAsync(id);
            if (site == null)
                return NotFound();

            await _siteService.DeleteAsync(id);
            return NoContent();
        }
    }
}
