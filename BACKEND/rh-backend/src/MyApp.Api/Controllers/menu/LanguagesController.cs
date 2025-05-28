using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.menu;
using MyApp.Api.Services.menu;

namespace MyApp.Api.Controllers.menu
{
    [Route("api/[controller]")]
    [ApiController]
    public class LanguagesController : ControllerBase
    {
        private readonly ILanguageService _service;

        public LanguagesController(ILanguageService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var languages = await _service.GetAllAsync();
            return Ok(languages);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            var language = await _service.GetByIdAsync(id);
            return language == null ? NotFound() : Ok(language);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] LanguageDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.LanguageId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] LanguageDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var updated = await _service.UpdateAsync(id, dto);
            return updated == null ? NotFound() : NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _service.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }
    }
}
