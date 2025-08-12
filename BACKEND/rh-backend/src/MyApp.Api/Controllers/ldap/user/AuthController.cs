using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.ldap.user;
using MyApp.Api.Services.users;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Data;

namespace MyApp.Api.Controllers.ldap.user;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ILdapService _ldapService;
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _context;

    public AuthController(ILdapService ldapService, IAuthService authService, IConfiguration configuration, AppDbContext context)
    {
        _ldapService = ldapService ?? throw new ArgumentNullException(nameof(ldapService));
        _authService = authService ?? throw new ArgumentNullException(nameof(authService));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginModel login)
    {
        if (!ModelState.IsValid || string.IsNullOrWhiteSpace(login.Username) || string.IsNullOrWhiteSpace(login.Password))
        {
            return BadRequest(new { Message = "Username and password are required", Type = "invalid_input" });
        }

        var result = await _authService.ValidateUserAsync(login.Username, login.Password);

        if (result.Type != "success" || result.User == null)
        {
            return Unauthorized(new { result.Message, result.Type });
        }

        var token = await _authService.GenerateJwtTokenAsync(result.User);

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // Ensure HTTPS in production
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddHours(1), // Align with JWT expiration
            Path = "/"
        };

        Response.Cookies.Append("AuthToken", token.AccessToken, cookieOptions);

        var userResponse = new
        {
            result.User.UserId,
            result.User.Email,
            result.User.Name,
            result.User.Department,
            result.User.UserType,
            Roles = result.User.UserRoles.Select(ur => ur.Role?.Name).Where(name => name != null)
        };

        return Ok(new { Token = token, User = userResponse, Message = result.Message, Type = result.Type });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutModel model)
    {
        if (string.IsNullOrWhiteSpace(model.RefreshToken))
        {
            Response.Cookies.Delete("AuthToken");
            return Ok(new { Message = "Logged out successfully (no refresh token provided)" });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == model.RefreshToken);

        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            await _context.SaveChangesAsync();
        }

        Response.Cookies.Delete("AuthToken");
        return Ok(new { Message = "Logged out successfully" });
    }
    
    public class LoginModel
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LogoutModel
    {
        public string? RefreshToken { get; set; }
    }
}