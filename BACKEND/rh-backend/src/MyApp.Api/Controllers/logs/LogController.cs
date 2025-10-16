using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.logs;
using MyApp.Api.Models.dto.logs;
using MyApp.Api.Services.logs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MyApp.Api.Controllers.logs
{
    [ApiController]
    [Route("api/[controller]")]
    public class LogController : ControllerBase
    {
        private readonly ILogService _logService;
        private readonly ILogger<LogController> _logger;

        public LogController(ILogService logService, ILogger<LogController> logger)
        {
            _logService = logService ?? throw new ArgumentNullException(nameof(logService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        [HttpPost("search")]
        // [AllowAnonymous]
        public async Task<ActionResult> Search([FromBody] LogSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            // if (!User.Identity?.IsAuthenticated ?? true)
            // {
            //     return Unauthorized(new { data = (object?)null, status = 401, message = "unauthorized" });
            // }
            try
            {
                var (logs, totalCount) = await _logService.SearchAsync(filters ?? new LogSearchFiltersDTO(), page, pageSize);
                return Ok(new 
                { 
                    data = new
                    {
                        Logs = logs,
                        TotalCount = totalCount,
                        Page = page,
                        PageSize = pageSize
                    },
                    status = 200, 
                    message = "success" 
                });
            }
            catch (ArgumentException)
            {
                return BadRequest(new { data = (object?)null, status = 400, message = "error" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching logs.");
                Console.WriteLine(ex);
                return StatusCode(500, new { data = (object?)null, status = 500, message = "error" });
            }
        }
    }
}