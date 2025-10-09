using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.ldap.user;
using MyApp.Api.Services.users;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MyApp.Api.Data;
using MyApp.Api.Services.logs;

namespace MyApp.Api.Controllers.ldap.user;

[Route("api/[controller]")]
[ApiController]
public class AuthController(
    ILdapService ldapService,
    IAuthService authService,
    ILogService logService,
    IConfiguration configuration,
    AppDbContext context)
    : ControllerBase
{
    private readonly ILdapService _ldapService = ldapService ?? throw new ArgumentNullException(nameof(ldapService));
    private readonly IAuthService _authService = authService ?? throw new ArgumentNullException(nameof(authService));
    private readonly ILogService _logService = logService ?? throw new ArgumentNullException(nameof(logService));
    private readonly IConfiguration _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    private readonly AppDbContext _context = context ?? throw new ArgumentNullException(nameof(context));

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenModel model)
    {
        if (string.IsNullOrWhiteSpace(model.RefreshToken))
        {
            return BadRequest(new { Message = "Refresh token is required", Type = "invalid_input" });
        }

        try
        {
            var tokenResponse = await _authService.RefreshTokenAsync(model.RefreshToken);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(1),
                Path = "/"
            };
            Response.Cookies.Append("AuthToken", tokenResponse.AccessToken, cookieOptions);

            return Ok(new
            {
                Token = tokenResponse,
                Message = "Token refreshed successfully",
                Type = "success"
            });
        }
        catch (SecurityTokenException ex)
        {
            return Unauthorized(new { Message = ex.Message, Type = "invalid_refresh_token" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"An error occurred during token refresh: {ex.Message}", Type = "error" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginModel login)
    {
        if (!ModelState.IsValid || string.IsNullOrWhiteSpace(login.Username) || string.IsNullOrWhiteSpace(login.Password))
        {
            return BadRequest(new { Message = "Username and password are required", Type = "invalid_input" });
        }

        try
        {
            var result = await _authService.ValidateUserAsync(login.Username, login.Password);

            if (result.Type != "success" || result.User == null)
            {
                return Unauthorized(new { result.Message, result.Type });
            }

            var token = await _authService.GenerateJwtTokenAsync(result.User);

            // Log successful authentication, explicitly specifying T as object
            await _logService.LogAsync<object>("AUTHENTICATION", null, null, result.User.UserId.ToString());

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Ensure HTTPS in production
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddMinutes(1) ,
                Path = "/"
            };

            Response.Cookies.Append("AuthToken", token.AccessToken, cookieOptions);

            var userResponse = new
            {
                result.User.UserId,
                result.User.Matricule,
                result.User.Email,
                result.User.Name,
                result.User.Department,
                result.User.UserType
            };

            return Ok(new { Token = token, User = userResponse, Message = result.Message, Type = result.Type });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"An error occurred during login: {ex.Message}", Type = "error" });
        }
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        try
        {
            // var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            Response.Cookies.Delete("AuthToken");

            // _logService.LogAsync<object>("LOGOUT", null, null, userId!).GetAwaiter().GetResult();

            return Ok(new { Message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { Message = $"An error occurred during logout: {ex.Message}", Type = "error" });
        }
    }

    public class LoginModel
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RefreshTokenModel
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}