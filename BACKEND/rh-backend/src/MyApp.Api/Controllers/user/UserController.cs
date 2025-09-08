using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.classes.user;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;

namespace MyApp.Api.Controllers.user;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IRoleHabilitationService _roleHabilitationService;

    public UserController(
        IUserService userService,
        IRoleHabilitationService roleHabilitationService)
    {
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        _roleHabilitationService = roleHabilitationService ?? throw new ArgumentNullException(nameof(roleHabilitationService));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        try
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    [HttpGet("{userId}/roles")]
    public async Task<ActionResult<IEnumerable<string>>> GetUserRoles(string userId)
    {
        try
        {
            var roleIds = await _userService.GetUserRolesAsync(userId);
            return Ok(roleIds);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    [HttpGet("{userId}/collaborators")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetCollaborators(string userId)
    {
        try
        {
            var collaborators = await _userService.GetCollaboratorsAsync(userId);
            return Ok(collaborators);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    [HttpGet("{matricule}/superior")]
    public async Task<ActionResult<UserDto>> GetSuperior(string matricule)
    {
        try
        {
            var superior = await _userService.GetSuperiorAsync(matricule);
            if (superior == null)
                return NotFound("No superior found for the specified user.");

            return Ok(superior);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    [HttpGet("drh")]
    public async Task<ActionResult<UserDto>> GetDrh()
    {
        try
        {
            var drh = await _userService.GetDrhAsync();
            
            if (drh == null)
                return NotFound("No DRH found.");

            return Ok(drh);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    [HttpPost("search")]
    public async Task<ActionResult<(IEnumerable<User>, int)>> Search([FromQuery] UserSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var (users, totalCount) = await _userService.SearchAsync(filters, page, pageSize);
            return Ok(new { Users = users, TotalCount = totalCount });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    [HttpGet("{userId}/habilitations")]
    public async Task<ActionResult<IEnumerable<Habilitation>>> GetHabilitationsByUserId(string userId)
    {
        try
        {
            var habilitations = await _roleHabilitationService.GetHabilitationsByUserIdAsync(userId);
            if (!habilitations.Any())
            {
                return Ok(new List<Habilitation>()); // Return empty list instead of NotFound for consistency
            }
            return Ok(habilitations);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}