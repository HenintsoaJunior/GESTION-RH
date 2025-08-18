using System.DirectoryServices;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.ldap.objectclass;
using MyApp.Api.Models.classes.objectclass;

namespace MyApp.Api.Controllers.ldap.objectclass;

[Route("api/[controller]")]
[ApiController]
public class ObjectClassController : ControllerBase
{
    private readonly IObjectClassService _objectClassService;
    private readonly IConfiguration _configuration;

    public ObjectClassController(IObjectClassService objectClassService, IConfiguration configuration)
    {
        _objectClassService = objectClassService ?? throw new ArgumentNullException(nameof(objectClassService));
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }
    
    [HttpGet("attributes/{objectClassName}")]
    public ActionResult<ObjectClassSchema> GetObjectClassAttributes(string objectClassName)
    {
        try
        {
            string? domainPath = _configuration.GetSection("LdapSettings:DomainPath").Value;
            if (string.IsNullOrWhiteSpace(domainPath))
            {
                Console.WriteLine("LDAP domain path is not configured.");
                return BadRequest("LDAP domain path is not configured.");
            }

            if (string.IsNullOrWhiteSpace(objectClassName))
            {
                return BadRequest("Object class name cannot be null or empty.");
            }

            var schema = _objectClassService.GetObjectClassAttributes(domainPath, objectClassName);
            if (schema == null)
            {
                return NotFound($"Object class {objectClassName} not found.");
            }

            return Ok(schema);
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"Input Error: {ex.Message}");
            return BadRequest(ex.Message);
        }
        catch (PlatformNotSupportedException ex)
        {
            Console.WriteLine($"Platform Error: {ex.Message}");
            return StatusCode(501, ex.Message);
        }
        catch (InvalidOperationException ex) when (ex.InnerException is DirectoryServicesCOMException)
        {
            Console.WriteLine($"AD Error: {ex.Message}");
            return StatusCode(500, "Error accessing Active Directory schema.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Controller Error: {ex.Message}");
            return StatusCode(500, "An unexpected error occurred while retrieving object class attributes.");
        }
    }

    [HttpGet]
    public ActionResult<List<ObjectClassAd>> GetObjectClasses()
    {
        try
        {
            string? domainPath = _configuration.GetSection("LdapSettings:DomainPath").Value;
            if (string.IsNullOrWhiteSpace(domainPath))
            {
                Console.WriteLine("LDAP domain path is not configured.");
                return BadRequest("LDAP domain path is not configured.");
            }

            var objectClasses = _objectClassService.GetObjectClassesFromActiveDirectory(domainPath);
            return Ok(objectClasses);
        }
        catch (InvalidOperationException ex) when (ex.InnerException is DirectoryServicesCOMException)
        {
            Console.WriteLine($"AD Error: {ex.Message}");
            return StatusCode(500, "Error accessing Active Directory.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Controller Error: {ex.Message}");
            return StatusCode(500, "An unexpected error occurred while retrieving object classes.");
        }
    }

    [HttpGet("custom")]
    public ActionResult<List<ObjectClassAd>> GetObjectClassesFromCustomDomain([FromQuery] string customDomainPath)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(customDomainPath))
            {
                return BadRequest("Custom domain path cannot be null or empty.");
            }

            var objectClasses = _objectClassService.GetObjectClassesFromActiveDirectory(customDomainPath);
            return Ok(objectClasses);
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"Input Error: {ex.Message}");
            return BadRequest(ex.Message);
        }
        catch (PlatformNotSupportedException ex)
        {
            Console.WriteLine($"Platform Error: {ex.Message}");
            return StatusCode(501, ex.Message);
        }
        catch (InvalidOperationException ex) when (ex.InnerException is DirectoryServicesCOMException)
        {
            Console.WriteLine($"AD Error: {ex.Message}");
            return StatusCode(500, "Error accessing Active Directory.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Controller Error: {ex.Message}");
            return StatusCode(500, "An unexpected error occurred while retrieving object classes.");
        }
    }

    [HttpGet("schema")]
    public ActionResult<List<ObjectClassSchema>> GetObjectClassSchema()
    {
        try
        {
            string? domainPath = _configuration.GetSection("LdapSettings:DomainPath").Value;
            if (string.IsNullOrWhiteSpace(domainPath))
            {
                Console.WriteLine("LDAP domain path is not configured.");
                return BadRequest("LDAP domain path is not configured.");
            }

            var schema = _objectClassService.GetObjectClassSchema(domainPath);
            return Ok(schema);
        }
        catch (InvalidOperationException ex) when (ex.InnerException is DirectoryServicesCOMException)
        {
            Console.WriteLine($"AD Error: {ex.Message}");
            return StatusCode(500, "Error accessing Active Directory schema.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Controller Error: {ex.Message}");
            return StatusCode(500, "An unexpected error occurred while retrieving object class schema.");
        }
    }

    [HttpGet("count")]
    public ActionResult<object> GetObjectClassCount()
    {
        try
        {
            string? domainPath = _configuration.GetSection("LdapSettings:DomainPath").Value;
            if (string.IsNullOrWhiteSpace(domainPath))
            {
                Console.WriteLine("LDAP domain path is not configured.");
                return BadRequest("LDAP domain path is not configured.");
            }

            var counts = _objectClassService.GetObjectClassCounts(domainPath);
            var result = new
            {
                Success = true,
                Message = "Object class counts retrieved successfully.",
                Data = counts,
                Timestamp = DateTime.UtcNow
            };

            return Ok(result);
        }
        catch (InvalidOperationException ex) when (ex.InnerException is DirectoryServicesCOMException)
        {
            Console.WriteLine($"AD Error: {ex.Message}");
            return StatusCode(500, new
            {
                Success = false,
                Message = "Error accessing Active Directory.",
                Error = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Controller Error: {ex.Message}");
            return StatusCode(500, new
            {
                Success = false,
                Message = "An unexpected error occurred while retrieving object class counts.",
                Error = ex.Message,
                Timestamp = DateTime.UtcNow
            });
        }
    }
}