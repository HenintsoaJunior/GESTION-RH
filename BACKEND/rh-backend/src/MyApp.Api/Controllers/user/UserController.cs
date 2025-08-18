using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.form.users;
using MyApp.Api.Services.users;

namespace MyApp.Api.Controllers.user;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
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
}