using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.list.menu;
using MyApp.Api.Services.menu;

namespace MyApp.Api.Controllers.menu
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;

        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }

        [HttpGet("hierarchy")]
        public async Task<ActionResult<IEnumerable<MenuHierarchyDto>>> GetMenuHierarchy([FromQuery] string[]? roleNames = null)
        {
            try
            {
                var menuHierarchy = await _menuService.GetMenuHierarchyAsync(roleNames);
                return Ok(menuHierarchy);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération du menu: {ex.Message}");
            }
        }

        [HttpGet("modules")]
        public async Task<ActionResult<IEnumerable<ModuleDto>>> GetModules()
        {
            try
            {
                var modules = await _menuService.GetModulesAsync();
                return Ok(modules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération des modules: {ex.Message}");
            }
        }
    }
}