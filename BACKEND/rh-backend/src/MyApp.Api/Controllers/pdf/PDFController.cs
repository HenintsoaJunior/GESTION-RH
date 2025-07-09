using Microsoft.AspNetCore.Mvc;
using Utils.pdf;

namespace MyApp.Api.Controllers.actions
{
    [Route("api/[controller]")]
    [ApiController]
    public class PDFController : ControllerBase
    {
        private readonly RecruitmentApprovalPDF _pdfGenerator;

        public PDFController()
        {
            _pdfGenerator = new RecruitmentApprovalPDF();
        }

        [HttpGet("download-approval-pdf")]
        public IActionResult DownloadApprovalPdf()
        {
            var (fileContent, contentType, fileName) = _pdfGenerator.PreparePdfDownload();
            return File(fileContent, contentType, fileName);
        }
    }
}