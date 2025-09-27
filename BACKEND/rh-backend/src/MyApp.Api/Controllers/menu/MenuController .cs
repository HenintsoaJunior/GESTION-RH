using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.menu;
using MyApp.Api.Services.menu;

namespace MyApp.Api.Controllers.menu
{
    [ApiController]
    [Route("api/[controller]")]
    public class MenuController(IMenuService menuService) : ControllerBase
    {
        [HttpGet("hierarchy")]
        public async Task<ActionResult<IEnumerable<MenuHierarchyDto>>> GetMenuHierarchy([FromQuery] string UserId)
        {
            try
            {
                var menuHierarchy = await menuService.GetMenuHierarchyAsync(UserId);
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
                var modules = await menuService.GetModulesAsync();
                return Ok(modules);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération des modules: {ex.Message}");
            }
        }
    }
}