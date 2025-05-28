using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.menu;
using MyApp.Api.Services.menu;

namespace MyApp.Api.Controllers.menu
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenusController : ControllerBase
    {
        private readonly IMenuService _service;

        public MenusController(IMenuService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var menus = await _service.GetAllAsync();
            return Ok(menus);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            var menu = await _service.GetByIdAsync(id);
            return menu == null ? NotFound() : Ok(menu);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MenuDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.MenuId }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] MenuDto dto)
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
