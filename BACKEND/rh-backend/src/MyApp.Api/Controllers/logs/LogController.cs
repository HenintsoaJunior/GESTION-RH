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
        public async Task<IActionResult> Search([FromBody] LogSearchFiltersDTO filters, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var (logs, totalCount) = await _logService.SearchAsync(filters ?? new LogSearchFiltersDTO(), page, pageSize);

                return Ok(new
                {
                    Logs = logs,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching logs.");
                return StatusCode(500, "An error occurred while searching logs.");
            }
        }

        
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                _logger.LogInformation("Retrieving all logs.");
                var logs = await _logService.GetAllAsync();
                return Ok(logs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving all logs.");
                return StatusCode(500, "An error occurred while retrieving logs.");
            }
        }
        [HttpGet("{logId}")]
        public async Task<IActionResult> GetById(string logId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(logId))
                {
                    return BadRequest("Log ID cannot be null or empty.");
                }

                var log = await _logService.GetByIdAsync(logId);

                if (log == null)
                {
                    _logger.LogWarning("Log with ID {LogId} not found.", logId);
                    return NotFound($"Log with ID {logId} not found.");
                }

                return Ok(log);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving log with ID: {LogId}", logId);
                return StatusCode(500, "An error occurred while retrieving the log.");
            }
        }


        [HttpPost]
        public async Task<IActionResult> Add([FromBody] LogDTOForm dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Invalid log data provided.");
                    return BadRequest(ModelState);
                }
                
                await _logService.AddAsync(dto);

                return CreatedAtAction(nameof(GetById), new { logId = dto.UserId }, dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding a new log.");
                return StatusCode(500, "An error occurred while adding the log.");
            }
        }
        
        [HttpPut("{logId}")]
        public async Task<IActionResult> Update(string logId, [FromBody] Log log)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(logId) || logId != log.LogId)
                {
                    return BadRequest("Log data is invalid or ID mismatch.");
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingLog = await _logService.GetByIdAsync(logId);
                if (existingLog == null)
                {
                    return NotFound($"Log with ID {logId} not found.");
                }

                await _logService.UpdateAsync(log);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating log with ID: {LogId}", logId);
                return StatusCode(500, "An error occurred while updating the log.");
            }
        }
        
        [HttpDelete("{logId}")]
        public async Task<IActionResult> Delete(string logId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(logId))
                {
                    _logger.LogWarning("Attempt to delete log with null or empty ID.");
                    return BadRequest("Log ID cannot be null or empty.");
                }

                var existingLog = await _logService.GetByIdAsync(logId);
                if (existingLog == null)
                {
                    return NotFound($"Log with ID {logId} not found.");
                }

                await _logService.DeleteAsync(logId);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting log with ID: {LogId}", logId);
                return StatusCode(500, "An error occurred while deleting the log.");
            }
        }
    }
}