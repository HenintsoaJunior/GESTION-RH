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
        private readonly IOrgImportService _orgImportService;
        private readonly IEmpImportService _empImportService;
        private readonly ITmpEmployeeService _tmpEmployeeService;
        private readonly AppDbContext _context;

        public ImportController(
            IImportService importService,
            IOrgImportService orgImportService,
            IEmpImportService empImportService,
            ITmpEmployeeService tmpEmployeeService,
            AppDbContext context)
        {
            _importService = importService ?? throw new ArgumentNullException(nameof(importService));
            _orgImportService = orgImportService ?? throw new ArgumentNullException(nameof(orgImportService));
            _empImportService = empImportService ?? throw new ArgumentNullException(nameof(empImportService));
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


        [HttpPost("import-org")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ImportOrg([FromForm] IFormFile? file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { status = 400, message = "CSV file must be provided", data = (object?)null });

                if (Path.GetExtension(file.FileName).ToLower() != ".csv")
                    return BadRequest(new { status = 400, message = "Only CSV files are allowed", data = (object?)null });

                const long maxFileSize = 10 * 1024 * 1024; // 10MB
                if(file.Length > maxFileSize)
                    return BadRequest(new { status = 400, message = "File too large", data = (object?)null });

                var result = await _orgImportService.ImportCsvAsync(file.OpenReadStream());

                return Ok(new
                {
                    status = 200,
                    message = $"CSV imported successfully: {result.TotalRows} rows, {result.DirectionsInserted} directions, {result.DepartmentsInserted} departments, {result.ServicesInserted} services",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = 500, message = ex.Message, data = (object?)null });
            }
        }


        [HttpPost("import-emp")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ImportEmp([FromForm] IFormFile? file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { status = 400, message = "CSV file must be provided", data = (object?)null });

                if (Path.GetExtension(file.FileName).ToLower() != ".csv")
                    return BadRequest(new { status = 400, message = "Only CSV files are allowed", data = (object?)null });

                const long maxFileSize = 10 * 1024 * 1024; // 10MB
                if(file.Length > maxFileSize)
                    return BadRequest(new { status = 400, message = "File too large", data = (object?)null });

                var result = await _empImportService.ImportEmployeesAsync(file.OpenReadStream());

                return Ok(new
                {
                    status = 200,
                    message = $"CSV imported successfully: {result.TotalRows} rows, {result.Inserted} employees inserted",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = 500, message = ex.Message, data = (object?)null });
            }
        }
    }
}