using System.DirectoryServices;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.ldap.user;
using MyApp.Api.Models.classes.user;

namespace MyApp.Api.Controllers.ldap.user;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly ILdapService _ldapService;
    private readonly IConfiguration _configuration;

    public UserController(ILdapService ldapService, IConfiguration configuration)
    {
        _ldapService = ldapService ?? throw new ArgumentNullException(nameof(ldapService));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    [HttpGet]
    public ActionResult<List<UserAd>> GetUsersFromActiveDirectory()
    {
        try
        {
            string? domainPath = _configuration.GetSection("LdapSettings:DomainPath").Value;
            if (string.IsNullOrWhiteSpace(domainPath))
            {
                Console.WriteLine("LDAP domain path is not configured.");
                return BadRequest("LDAP domain path is not configured.");
            }

            var users = _ldapService.GetUsersFromActiveDirectory(domainPath);
            return Ok(users);
        }
        catch (InvalidOperationException ex) when (ex.InnerException is DirectoryServicesCOMException)
        {
            Console.WriteLine($"AD Error: {ex.Message}");
            return StatusCode(500, "Error accessing Active Directory.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Controller Error: {ex.Message}");
            return StatusCode(500, "An unexpected error occurred while retrieving users.");
        }
    }
    
    [HttpGet("AD/hierarchy")]
    public ActionResult<List<UserAd>> BuildFullOrganisationHierarchy()
    {
        try
        {
            string? domainPath = _configuration.GetSection("LdapSettings:DomainPath").Value;
            if (string.IsNullOrWhiteSpace(domainPath))
            {
                return BadRequest("LDAP domain path is not configured.");
            }

            List<UserAd>? users = _ldapService.GetUsersFromActiveDirectory(domainPath);
            if (users == null || !users.Any())
            {
                return NotFound("No users found in Active Directory.");
            }

            foreach (var user in users)
            {
                if (string.IsNullOrWhiteSpace(user.DisplayName) && string.IsNullOrWhiteSpace(user.Email))
                {
                    continue;
                }

                try
                {
                    UserAd? manager = _ldapService.GetManager(domainPath, user.DisplayName, user.Email);
                    if (manager != null)
                    {
                        user.DirectReports.Add(manager);
                    }
                }
                catch (ArgumentException ex)
                {
                    Console.WriteLine($"Error retrieving manager for user {user.DisplayName ?? "Unknown"}: {ex.Message}");
                    // Optionally, continue or handle the error as needed
                }
            }

            return Ok(users);
        }
        catch (InvalidOperationException ex) when (ex.InnerException is DirectoryServicesCOMException)
        {
            Console.WriteLine($"AD Error: {ex.Message}");
            return StatusCode(500, "Error accessing Active Directory.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Controller Error: {ex.Message}");
            return StatusCode(500, "An unexpected error occurred while building hierarchy.");
        }
    }

    [HttpGet("manager")]
    public ActionResult<UserAd> GetManager([FromQuery] string? displayName = null, [FromQuery] string? mail = null)
    {
        try
        {
            string? domainPath = _configuration.GetSection("LdapSettings:DomainPath").Value;
            if (string.IsNullOrWhiteSpace(domainPath))
            {
                Console.WriteLine("LDAP domain path is not configured.");
                return BadRequest("LDAP domain path is not configured.");
            }

            var manager = _ldapService.GetManager(domainPath, displayName, mail);
            if (manager == null)
            {
                return NotFound("Manager not found.");
            }

            return Ok(manager);
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"Input Error: {ex.Message}");
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex) when (ex.InnerException is DirectoryServicesCOMException)
        {
            Console.WriteLine($"AD Error: {ex.Message}");
            return StatusCode(500, "Error accessing Active Directory.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Controller Error: {ex.Message}");
            return StatusCode(500, "An unexpected error occurred while retrieving manager.");
        }
    }
}