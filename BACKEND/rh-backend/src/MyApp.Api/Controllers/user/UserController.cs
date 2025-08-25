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

    public UserController(IUserService userService)
    {
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetAll()
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
}