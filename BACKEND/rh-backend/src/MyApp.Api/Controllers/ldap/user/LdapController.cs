using System.DirectoryServices;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.ldap.user;
using MyApp.Api.Models.classes.user;

namespace MyApp.Api.Controllers.ldap.user;

[Route("api/[controller]")]
[ApiController]
public class LdapController : ControllerBase
{
    private readonly ILdapService _ldapService;
    private readonly IConfiguration _configuration;

    public LdapController(ILdapService ldapService, IConfiguration configuration)
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
    public ActionResult<List<UserAd>> GetFullOrganisationHierarchy()
    {
        try
        {
            string? domainPath = _configuration.GetSection("LdapSettings:DomainPath").Value;
            if (string.IsNullOrWhiteSpace(domainPath))
            {
                return BadRequest("LDAP domain path is not configured.");
            }

            var hierarchy = _ldapService.BuildFullOrganisationHierarchy(domainPath);

            return Ok(hierarchy);
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
    
    [HttpPost("sync")]
    public async Task<ActionResult<object>> ActualiseUsers()
    {
        try
        {
            string? domainPath = _configuration.GetSection("LdapSettings:DomainPath").Value;
            if (string.IsNullOrWhiteSpace(domainPath))
            {
                Console.WriteLine("LDAP domain path is not configured.");
                return BadRequest("LDAP domain path is not configured.");
            }

            var (added, updated, deleted) = await _ldapService.ActualiseUsers(domainPath);
            
            var result = new
            {
                Success = true,
                Message = "User synchronization completed successfully.",
                Statistics = new
                {
                    UsersAdded = added,
                    UsersUpdated = updated,
                    UsersDeleted = deleted,
                    TotalProcessed = added + updated + deleted
                },
                Timestamp = DateTime.UtcNow
            };

            Console.WriteLine($"User synchronization completed: {added} added, {updated} updated, {deleted} deleted");
            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.InnerException is DirectoryServicesCOMException)
        {
            Console.WriteLine($"AD Error during sync: {ex.Message}");
            return StatusCode(500, new { 
                Success = false, 
                Message = "Error accessing Active Directory during synchronization.",
                Error = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (InvalidOperationException ex)
        {
            Console.WriteLine($"Sync Error: {ex.Message}");
            return StatusCode(500, new { 
                Success = false, 
                Message = "Error during user synchronization.",
                Error = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected Controller Error during sync: {ex.Message}");
            return StatusCode(500, new { 
                Success = false, 
                Message = "An unexpected error occurred during user synchronization.",
                Error = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }
    
    [HttpPost("sync/custom")]
    public async Task<ActionResult<object>> ActualiseUsersCustomDomain([FromQuery] string customDomainPath)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(customDomainPath))
            {
                return BadRequest("Custom domain path cannot be null or empty.");
            }

            var (added, updated, deleted) = await _ldapService.ActualiseUsers(customDomainPath);
            
            var result = new
            {
                Success = true,
                Message = "User synchronization with custom domain completed successfully.",
                DomainPath = customDomainPath,
                Statistics = new
                {
                    UsersAdded = added,
                    UsersUpdated = updated,
                    UsersDeleted = deleted,
                    TotalProcessed = added + updated + deleted
                },
                Timestamp = DateTime.UtcNow
            };

            Console.WriteLine($"Custom domain sync completed for {customDomainPath}: {added} added, {updated} updated, {deleted} deleted");
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"Input Error: {ex.Message}");
            return BadRequest(new { 
                Success = false, 
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (PlatformNotSupportedException ex)
        {
            Console.WriteLine($"Platform Error: {ex.Message}");
            return StatusCode(501, new { 
                Success = false, 
                Message = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (InvalidOperationException ex) when (ex.InnerException is DirectoryServicesCOMException)
        {
            Console.WriteLine($"AD Error during custom sync: {ex.Message}");
            return StatusCode(500, new { 
                Success = false, 
                Message = "Error accessing Active Directory during custom synchronization.",
                Error = ex.Message,
                DomainPath = customDomainPath,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Unexpected Controller Error during custom sync: {ex.Message}");
            return StatusCode(500, new { 
                Success = false, 
                Message = "An unexpected error occurred during custom synchronization.",
                Error = ex.Message,
                DomainPath = customDomainPath,
                Timestamp = DateTime.UtcNow
            });
        }
    }
}