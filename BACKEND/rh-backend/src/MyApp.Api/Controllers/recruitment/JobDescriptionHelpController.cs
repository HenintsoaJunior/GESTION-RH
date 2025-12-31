using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Repositories.recruitment;

namespace MyApp.Api.Controllers.recruitment;

[ApiController]
[Route("api/recruitment/params")]
public class JobDescriptionHelpController(IJobDescriptionRepository repo) 
 : ControllerBase
{
    private readonly IJobDescriptionRepository _repo = repo;


    [HttpGet("educations")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllEducations() {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            var results = await _repo.GetAllEducations();
            return Ok(new { data = results, status = 200, message = "Etudes trouvées avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpGet("level-educations")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllLevelEducations() {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            var results = await _repo.GetAllLevelEducations();
            return Ok(new { data = results, status = 200, message = "Niveaux d'études trouvées avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }


    [HttpGet("soft-skills")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllSoftSkills() {
        // if(!User.Identity?.IsAuthenticated ?? true) {
        //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        // }

        try {
            var results = await _repo.GetAllSoftSkills();
            return Ok(new { data = results, status = 200, message = "Qualités personnelles trouvées avec succès" });
        }
        catch(ArgumentException ex) {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch(Exception ex) {
            return StatusCode(500, new { data = (object?)null, status = 500, message = ex.Message });
        }
    }
}
