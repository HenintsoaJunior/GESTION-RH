using Microsoft.AspNetCore.Authorization;
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

    [HttpGet("departments")]
    [AllowAnonymous]
    public async Task<ActionResult> GetDistinctDepartments()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try
        {
            var departments = await _userService.GetDistinctDepartmentsAsync();
            return Ok(new { data = departments, status = 200, message = "success" });
        }
        catch (ArgumentException)
        {
            return BadRequest(new { data = (object?)null, status = 400, message = "error" });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
        }
    }

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
            var users = await _userService.GetAllAsync();
            return Ok(new { data = users, status = 200, message = "success" });
        }
        catch (ArgumentException)
        {
            return BadRequest(new { data = (object?)null, status = 400, message = "error" });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
        }
    }

    [HttpPost("search")]
    [AllowAnonymous] 
    public async Task<ActionResult> Search([FromQuery] UserSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try
        {
            var (users, totalCount) = await _userService.SearchAsync(filters, page, pageSize);
            return Ok(new { data = new { Users = users, TotalCount = totalCount }, status = 200, message = "success" });
        }
        catch (ArgumentException)
        {
            return BadRequest(new { data = (object?)null, status = 400, message = "error" });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
        }
    }

    [HttpGet("{userId}/roles")]
    [AllowAnonymous]
    public async Task<ActionResult> GetUserRoles(string userId)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try
        {
            var roleIds = await _userService.GetUserRolesAsync(userId);
            return Ok(new { data = roleIds, status = 200, message = "success" });
        }
        catch (ArgumentException)
        {
            return BadRequest(new { data = (object?)null, status = 400, message = "error" });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
        }
    }


    [HttpGet("{userId}/access-habilitations")]
    [AllowAnonymous]
    public async Task<ActionResult> GetUserHabilitationsAccess(string userId)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try
        {
            var roleIds = await _userService.GetUserHabilitationAsync(userId);
            return Ok(new { data = roleIds, status = 200, message = "success" });
        }
        catch (ArgumentException)
        {
            return BadRequest(new { data = (object?)null, status = 400, message = "error" });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
        }
    }

    [HttpPost("infos")]
    [AllowAnonymous]
    public async Task<ActionResult> GetUsersInfo([FromBody] string[] userIds)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try
        {
            if (userIds == null || userIds.Length == 0)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "User IDs cannot be empty." });
            }

            var usersInfo = await _userService.GetUsersInfo(userIds);
            return Ok(new { data = usersInfo, status = 200, message = "success" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
        }
    }


    [HttpGet("{userId}/habilitations")]
    [AllowAnonymous]
    public async Task<ActionResult> GetHabilitationsByUserId(string userId)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "User ID cannot be empty." });
            }

            var habilitations = await _roleHabilitationService.GetHabilitationsByUserIdAsync(userId);
            var data = habilitations?.Any() == true ? habilitations : new List<Habilitation>();
            return Ok(new { data = data, status = 200, message = "success" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
        }
    }

    [HttpGet("{userId}/info")]
    [AllowAnonymous]
    public async Task<ActionResult> GetUserInfo(string userId)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "User ID cannot be empty." });
            }

            var collaborators = await _userService.GetUserInfo(userId);
            var data = collaborators?.Any() == true ? collaborators : new List<UserInfoDto>();
            return Ok(new { data = data, status = 200, message = "success" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
        }
    }


    [HttpGet("{userId}/collaborators")]
    [AllowAnonymous]
    public async Task<ActionResult> GetCollaborators(string userId)
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
        }

        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "User ID cannot be empty." });
            }

            var collaborators = await _userService.GetCollaboratorsAsync(userId);
            var data = collaborators?.Any() == true ? collaborators : new List<UserDto>();
            return Ok(new { data = data, status = 200, message = "success" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
        }
    }

///
/// 
/// 


    // [HttpGet("{matricule}/superior")]
    // public async Task<ActionResult<UserDto>> GetSuperior(string matricule)
    // {
    //     try
    //     {
    //         var superior = await _userService.GetSuperiorAsync(matricule);
    //         if (superior == null)
    //             return NotFound("No superior found for the specified user.");

    //         return Ok(superior);
    //     }
    //     catch (ArgumentException ex)
    //     {
    //         return BadRequest(ex.Message);
    //     }
    //     catch (Exception e)
    //     {
    //         Console.WriteLine(e);
    //         throw;
    //     }
    // }

    // [HttpGet("drh")]
    // public async Task<ActionResult<UserDto>> GetDrh()
    // {
    //     try
    //     {
    //         var drh = await _userService.GetDrhAsync();
            
    //         if (drh == null)
    //             return NotFound("No DRH found.");

    //         return Ok(drh);
    //     }
    //     catch (Exception e)
    //     {
    //         Console.WriteLine(e);
    //         throw;
    //     }
    // }

    // [HttpGet("director/{department}")]
    // public async Task<ActionResult<UserDto>> GetDirectorByDepartment(string department)
    // {
    //     try
    //     {
    //         var director = await _userService.GetDirectorByDepartmentAsync(department);
    //         if (director == null)
    //             return NotFound($"No director found for the department: {department}");

    //         return Ok(director);
    //     }
    //     catch (ArgumentException ex)
    //     {
    //         return BadRequest(ex.Message);
    //     }
    //     catch (Exception e)
    //     {
    //         Console.WriteLine(e);
    //         throw;
    //     }
    // }

    
}