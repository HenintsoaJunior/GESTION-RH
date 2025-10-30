using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Models.dto.users;
using MyApp.Api.Services.users;

namespace MyApp.Api.Controllers.users
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserAvailabilityController : ControllerBase
    {
        private readonly IUserAvailabilityService _userAvailabilityService;

        public UserAvailabilityController(IUserAvailabilityService userAvailabilityService)
        {
            _userAvailabilityService = userAvailabilityService ?? throw new ArgumentNullException(nameof(userAvailabilityService));
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult> CreateAvailability([FromBody] UserAvailabilityFormDTO availability)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (availability == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Availability data cannot be null" });
            }

            try
            {
                var userId = await _userAvailabilityService.CreateAsync(availability);
                var responseData = new { UserId = userId };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { data = (object?)null, status = 409, message = ex.Message });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpGet("{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult> GetAvailabilityByUserId(string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "User ID cannot be null or empty" });
            }

            try
            {
                var availability = await _userAvailabilityService.GetByIdAsync(userId);
                var responseData = availability != null 
                    ? new { UserId = availability.UserId!, Status = availability.Status } 
                    : new { UserId = userId, Status = "disponible" };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }

        [HttpPut("{userId}")]
        // [AllowAnonymous]
        public async Task<ActionResult> UpdateAvailability(string userId, [FromBody] UserAvailabilityFormDTO availability)
        {
            // if (!User.Identity?.IsAuthenticated ?? true)
            // {
            //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            // }

            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "User ID cannot be null or empty" });
            }

            if (availability == null)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "Availability data cannot be null" });
            }

            try
            {
                var updated = await _userAvailabilityService.UpdateAsync(userId, availability);
                if (!updated)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = $"Availability for User ID {userId} not found" });
                }
                return Ok(new { data = new { UserId = userId, Status = availability.Status }, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { data = (object?)null, status = 404, message = ex.Message });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
        
        [HttpDelete("{userId}")]
        [AllowAnonymous]
        public async Task<ActionResult> DeleteAvailability(string userId)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            }

            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "User ID cannot be null or empty" });
            }

            try
            {
                var deleted = await _userAvailabilityService.DeleteAsync(userId);
                if (!deleted)
                {
                    return NotFound(new { data = (object?)null, status = 404, message = $"Availability for User ID {userId} not found" });
                }

                var responseData = new { 
                    message = $"Availability for User ID {userId} successfully deleted",
                    data = new { UserId = userId }
                };
                return Ok(new { data = responseData, status = 200, message = "success" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = ex.Message });
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}