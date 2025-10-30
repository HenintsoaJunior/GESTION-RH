using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using MyApp.Api.Services.import;
using MyApp.Api.Services.tmp;
using MyApp.Api.Data;

namespace MyApp.Api.Controllers.import
{
    [Route("api/[controller]")]
    [ApiController]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class ImportController : ControllerBase
    {
        private readonly IImportService _importService;
        private readonly ITmpEmployeeService _tmpEmployeeService;
        private readonly AppDbContext _context;

        public ImportController(
            IImportService importService,
            ITmpEmployeeService tmpEmployeeService,
            AppDbContext context)
        {
            _importService = importService ?? throw new ArgumentNullException(nameof(importService));
            _tmpEmployeeService = tmpEmployeeService ?? throw new ArgumentNullException(nameof(tmpEmployeeService));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        [HttpPost("import")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Import([FromForm] IFormFile? employeeFile)
        {
            try
            {
                if (employeeFile == null || employeeFile.Length == 0)
                {
                    return BadRequest(new
                    {
                        status = 400,
                        message = "Employee file must be provided",
                        data = (object?)null
                    });
                }

                var fileExtension = Path.GetExtension(employeeFile.FileName).ToLower();
                if (fileExtension != ".csv")
                {
                    return BadRequest(new
                    {
                        status = 400,
                        message = "Only CSV files are allowed",
                        data = (object?)null
                    });
                }

                const long maxFileSize = 10 * 1024 * 1024; // 10MB
                if (employeeFile.Length > maxFileSize)
                {
                    return BadRequest(new
                    {
                        status = 400,
                        message = $"File size exceeds maximum allowed size of {maxFileSize / 1024 / 1024}MB",
                        data = (object?)null
                    });
                }

                var result = await _importService.ProcessEmployeeCsvAsync(
                    employeeFile.OpenReadStream(),
                    employeeFile.FileName
                );

                return Ok(new
                {
                    status = 200,
                    message = $"File imported successfully. {result.TotalRows} rows found.",
                    data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    status = 400,
                    message = ex.Message,
                    data = (object?)null
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    status = 500,
                    message = $"An error occurred during import: {ex.Message}",
                    data = (object?)null
                });
            }
        }
    }
}