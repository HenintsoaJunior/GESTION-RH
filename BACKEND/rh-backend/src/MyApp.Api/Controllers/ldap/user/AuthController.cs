using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.ldap.user;
namespace MyApp.Api.Controllers.ldap.user;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly ILdapService _ldapService;
    private readonly IConfiguration _configuration;

    public AuthController(ILdapService ldapService, IConfiguration configuration)
    {
        _ldapService = ldapService ?? throw new ArgumentNullException(nameof(ldapService));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }
    
    
}