using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.users_simple;
using MyApp.Api.Services.users_simple;

namespace MyApp.Api.Controllers.users_simple
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserSimpleController : ControllerBase
    {
        private readonly IUserSimpleService _userService;

        public UserSimpleController(IUserSimpleService userService)
        {
            _userService = userService ?? throw new ArgumentNullException(nameof(userService));
        }

        [HttpPost("register")]
        public async Task<ActionResult<UserSimpleDto>> Register([FromBody] UserSimpleDto userDto)
        {
            try
            {
                var registeredUser = await _userService.RegisterAsync(userDto);
                return Ok(registeredUser);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
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

        [HttpPost("login")]
        public async Task<ActionResult<UserSimpleDto>> Login([FromBody] LoginDto loginDto)
        {
            try
            {
                var user = await _userService.LoginAsync(loginDto.Email, loginDto.Password);
                if (user == null)
                    return Unauthorized("Invalid email or password.");

                return Ok(user);
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
}