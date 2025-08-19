using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.site;
using MyApp.Api.Services.site;

namespace MyApp.Api.Controllers.site
{
    [ApiController]
    [Route("api/[controller]")]
    public class SiteController(ISiteService siteService) : ControllerBase
    {
        // GET: api/site
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Site>>> GetAll()
        {
            var sites = await siteService.GetAllAsync();
            return Ok(sites);
        }

        // GET: api/site/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Site>> GetById(string id)
        {
            var site = await siteService.GetByIdAsync(id);
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

            await siteService.AddAsync(site);
            return CreatedAtAction(nameof(GetById), new { id = site.SiteId }, site);
        }

        // PUT: api/site/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult> Update(string id, [FromBody] Site site)
        {
            if (id != site.SiteId)
                return BadRequest("L'ID dans l'URL ne correspond pas à l'entité.");

            var existing = await siteService.GetByIdAsync(id);
            if (existing == null)
                return NotFound();

            await siteService.UpdateAsync(site);
            return NoContent();
        }

        // DELETE: api/site/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(string id)
        {
            var site = await siteService.GetByIdAsync(id);
            if (site == null)
                return NotFound();

            await siteService.DeleteAsync(id);
            return NoContent();
        }
    }
}
