using Microsoft.AspNetCore.Mvc;
using MyApp.Api.Services.docusign;

namespace MyApp.Api.Controllers.docusign
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocuSignTestController : ControllerBase
    {
        private readonly IDocuSignAuthService _authService;
        private readonly IDocuSignEnvelopeService _envelopeService;
        private readonly IDocuSignDocumentService _documentService;
        private readonly ILogger<DocuSignTestController> _logger;

        public DocuSignTestController(
            IDocuSignAuthService authService,
            IDocuSignEnvelopeService envelopeService,
            IDocuSignDocumentService documentService,
            ILogger<DocuSignTestController> logger)
        {
            _authService = authService;
            _envelopeService = envelopeService;
            _documentService = documentService;
            _logger = logger;
        }

        // Endpoint 1: Obtenir l'URL d'autorisation
        [HttpGet("auth-url")]
        public IActionResult GetAuthUrl()
        {
            try
            {
                var url = _authService.GetAuthorizationUrl();
                return Ok(new { authUrl = url });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la génération de l'URL d'authentification");
                return BadRequest(new { error = ex.Message });
            }
        }

        // Endpoint 2: Échanger le code contre un token
        [HttpGet("exchange-code")]
        public async Task<IActionResult> ExchangeCode([FromQuery] string code)
        {
            try
            {
                var authResult = await _authService.ExchangeCodeForTokenAsync(code);
                return Ok(authResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'échange du code");
                return BadRequest(new { error = ex.Message });
            }
        }

        // Endpoint 3: Tester l'authentification
        [HttpGet("check-auth")]
        public IActionResult CheckAuth()
        {
            try
            {
                var isAuthenticated = _authService.IsAuthenticated();
                var token = _authService.GetAccessToken();
                
                return Ok(new 
                { 
                    isAuthenticated, 
                    hasToken = !string.IsNullOrEmpty(token),
                    tokenLength = token?.Length 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la vérification de l'authentification");
                return BadRequest(new { error = ex.Message });
            }
        }

        // Endpoint 4: Envoyer un document simple
        [HttpPost("send-document")]
        public async Task<IActionResult> SendDocument([FromBody] SendDocumentRequest request)
        {
            try
            {
                var envelope = await _envelopeService.SendSimpleDocumentAsync(
                    request.SignerEmail,
                    request.SignerName,
                    request.Subject
                );

                return Ok(envelope);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'envoi du document");
                return BadRequest(new { error = ex.Message });
            }
        }

        public class SendDocumentRequest
        {
            public string SignerEmail { get; set; } = string.Empty;
            public string SignerName { get; set; } = string.Empty;
            public string Subject { get; set; } = "Veuillez signer ce document";
        }

        // Endpoint 5: Créer une URL de signature embedded
        [HttpGet("embedded-url/{envelopeId}")]
        public async Task<IActionResult> GetEmbeddedUrl(
            string envelopeId, 
            [FromQuery] string email,
            [FromQuery] string name)
        {
            try
            {
                var url = await _envelopeService.CreateEmbeddedSigningUrlAsync(
                    envelopeId,
                    email,
                    name
                );

                return Ok(new { embeddedUrl = url });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la création de l'URL embedded");
                return BadRequest(new { error = ex.Message });
            }
        }

        // Endpoint 6: Lister les enveloppes
        [HttpGet("envelopes")]
        public async Task<IActionResult> ListEnvelopes([FromQuery] int days = 30, [FromQuery] string? status = null)
        {
            try
            {
                var envelopes = await _envelopeService.ListEnvelopesAsync(days, status);
                return Ok(envelopes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la récupération des enveloppes");
                return BadRequest(new { error = ex.Message });
            }
        }

        // Endpoint 7: Télécharger un document signé
        [HttpGet("download/{envelopeId}/{documentId}")]
        public async Task<IActionResult> DownloadDocument(string envelopeId, string documentId)
        {
            try
            {
                var documentBytes = await _envelopeService.DownloadSignedDocumentAsync(envelopeId, documentId);
                return File(documentBytes, "application/pdf", $"document-{documentId}.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du téléchargement du document");
                return BadRequest(new { error = ex.Message });
            }
        }

        // Endpoint 8: Tester le service de documents
        [HttpGet("test-document-service")]
        public IActionResult TestDocumentService()
        {
            try
            {
                var defaultPath = _documentService.GetDefaultDocumentPath();
                var exists = _documentService.DocumentExists("document.pdf");
                
                return Ok(new 
                { 
                    defaultDocumentPath = defaultPath,
                    documentExists = exists,
                    folderInfo = "Vérifiez que le document PDF existe dans le dossier configuré"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors du test du service de documents");
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}