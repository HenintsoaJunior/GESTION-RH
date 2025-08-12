using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.ldap.user;
using MyApp.Api.Services.users;

namespace MyApp.Api.Controllers.ldap.user;

[Route("api/[controller]")]
[ApiController]
public class AuthController(ILdapService ldapService, IConfiguration configuration, IAuthService authService)
    : ControllerBase
{
    private readonly ILdapService _ldapService = ldapService ?? throw new ArgumentNullException(nameof(ldapService));
    private readonly IConfiguration _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginModel login)
    {
        var result = await authService.ValidateUserAsync(login.Username, login.Password);
        
        if (result.Type == "success")
        {
            var token = authService.GenerateJwtToken(result.User!);

            var cookieOptions = new CookieOptions
            {
                HttpOnly = false,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(5),
                Path = "/",
            };

            Response.Cookies.Append("AuthToken", token.AccessToken, cookieOptions);

            return Ok(new { token, user = result.User, result.Message, result.Type });
        }
        else
        {
            var errorResponse = new { result.Message, result.Type };
            return Ok(errorResponse);
        }
    }
    
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("AuthToken");
        return Ok(new { message = "Logged out successfully" });
    }
    
    public class LoginModel
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
    
}