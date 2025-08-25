using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.users;
using MyApp.Api.Services.users;

namespace MyApp.Api.Controllers.user
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoleController(
        IRoleService roleService,
        IRoleHabilitationService roleHabilitationService,
        IHabilitationService habilitationService,
        ILogger<RoleController> logger)
        : ControllerBase
    {
        private readonly ILogger<RoleController> _logger = logger;

        // -------------------- RÔLES --------------------
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Role>>> GetAllRoles()
        {
            var roles = await roleService.GetAllAsync();
            return Ok(roles);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Role>> GetRoleById(string id)
        {
            var role = await roleService.GetByIdAsync(id);
            if (role == null) return NotFound();
            return Ok(role);
        }

        [HttpPost]
        public async Task<ActionResult> CreateRole([FromBody] Role role)
        {
            await roleService.AddAsync(role);
            return CreatedAtAction(nameof(GetRoleById), new { id = role.RoleId }, role);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateRole(string id, [FromBody] Role role)
        {
            if (id != role.RoleId) return BadRequest("ID mismatch");

            await roleService.UpdateAsync(role);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteRole(string id)
        {
            await roleService.DeleteAsync(id);
            return NoContent();
        }

        // -------------------- HABILITATIONS --------------------
        [HttpGet("habilitations")]
        public async Task<ActionResult<IEnumerable<Habilitation>>> GetAllHabilitations()
        {
            var habilitations = await habilitationService.GetAllAsync();
            return Ok(habilitations);
        }

        [HttpGet("habilitations/{id}")]
        public async Task<ActionResult<Habilitation>> GetHabilitationById(string id)
        {
            var habilitation = await habilitationService.GetByIdAsync(id);
            if (habilitation == null) return NotFound();
            return Ok(habilitation);
        }

        [HttpPost("habilitations")]
        public async Task<ActionResult> CreateHabilitation([FromBody] Habilitation habilitation)
        {
            await habilitationService.AddAsync(habilitation);
            return CreatedAtAction(nameof(GetHabilitationById), new { id = habilitation.HabilitationId }, habilitation);
        }

        [HttpPut("habilitations/{id}")]
        public async Task<ActionResult> UpdateHabilitation(string id, [FromBody] Habilitation habilitation)
        {
            if (id != habilitation.HabilitationId) return BadRequest("ID mismatch");

            await habilitationService.UpdateAsync(habilitation);
            return NoContent();
        }

        [HttpDelete("habilitations/{id}")]
        public async Task<ActionResult> DeleteHabilitation(string id)
        {
            await habilitationService.DeleteAsync(id);
            return NoContent();
        }

        // -------------------- ROLE-HABILITATIONS --------------------
        [HttpGet("role-habilitations")]
        public async Task<ActionResult<IEnumerable<RoleHabilitation>>> GetAllRoleHabilitations()
        {
            var roleHabilitations = await roleHabilitationService.GetAllAsync();
            return Ok(roleHabilitations);
        }

        [HttpGet("role-habilitations/{habilitationId}/{roleId}")]
        public async Task<ActionResult<RoleHabilitation>> GetRoleHabilitation(string habilitationId, string roleId)
        {
            var roleHabilitation = await roleHabilitationService.GetByKeysAsync(habilitationId, roleId);
            if (roleHabilitation == null) return NotFound();
            return Ok(roleHabilitation);
        }

        [HttpPost("role-habilitations")]
        public async Task<ActionResult> CreateRoleHabilitation([FromBody] RoleHabilitation roleHabilitation)
        {
            await roleHabilitationService.AddAsync(roleHabilitation);
            return CreatedAtAction(nameof(GetRoleHabilitation), new { habilitationId = roleHabilitation.HabilitationId, roleId = roleHabilitation.RoleId }, roleHabilitation);
        }

        [HttpPut("role-habilitations")]
        public async Task<ActionResult> UpdateRoleHabilitation([FromBody] RoleHabilitation roleHabilitation)
        {
            await roleHabilitationService.UpdateAsync(roleHabilitation);
            return NoContent();
        }

        [HttpDelete("role-habilitations/{habilitationId}/{roleId}")]
        public async Task<ActionResult> DeleteRoleHabilitation(string habilitationId, string roleId)
        {
            await roleHabilitationService.DeleteAsync(habilitationId, roleId);
            return NoContent();
        }
    }
}
