using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Entities.certificate;
using MyApp.Api.Utils.pdf;

namespace MyApp.Api.Controllers.pdf
{
    [ApiController]
    [Route("api/[controller]")]
    public class CertificatesController (IConfiguration configuration, ILogger<CertificatesController> logger) : ControllerBase
    {
        private readonly IConfiguration _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        private readonly  ILogger<CertificatesController> _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        
        [HttpPost("hosting")]
        public IActionResult GenerateHostingCertificate([FromBody] HostingCertificate hostingCertificate)
        {
            try
            {
                hostingCertificate.CompanyName = _configuration["Company:Name"];
                hostingCertificate.FooterDetails = _configuration["Footer:Details"];
                var pdfBytes = new PdfGenerator().GenerateHostingCertificatePdf(hostingCertificate);
                var fileName = $"Attestation_Hébergement_{hostingCertificate.EmployeeName}_{DateTime.Now:yyyyMMdd}.pdf";

                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la génération de l'attestation d'hébergement");
                return StatusCode(500, new { message = ex.Message });
            }
        }
        
        [HttpPost("employment")]
        public IActionResult GenerateEmploymentCertificate([FromBody] EmployeeCertificate employeeCertificate)
        {
            try
            {
                employeeCertificate.CompanyName = _configuration["Company:Name"];
                employeeCertificate.FooterDetails = _configuration["Footer:Details"];
                var pdfBytes = new PdfGenerator().GenerateEmploymentCertificatePdf(employeeCertificate);
                var fileName = $"Attestation_Emploi_{employeeCertificate.EmployeeName}_{DateTime.Now:yyyyMMdd}.pdf";

                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la génération de l'attestation d'emploi");
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}
