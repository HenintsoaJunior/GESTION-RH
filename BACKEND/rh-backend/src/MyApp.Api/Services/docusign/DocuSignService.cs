using System.Text;
using System.Web;
using DocuSign.eSign.Api;
using DocuSign.eSign.Client;
using DocuSign.eSign.Model;
using Newtonsoft.Json;
using MyApp.Api.Models.dto.docusign;

namespace MyApp.Api.Services.docusign
{
    // ==================== INTERFACES ====================
    public interface IDocuSignAuthService
    {
        string GetAuthorizationUrl();
        Task<DocuSignAuthDto> ExchangeCodeForTokenAsync(string code);
        bool IsAuthenticated();
        string? GetAccessToken();
        void SetAccessToken(string token);
        void ClearAuthentication();
    }

    public interface IDocuSignEnvelopeService
    {
        Task<EnvelopeDto> SendSimpleDocumentAsync(string signerEmail, string signerName, string subject);
        Task<EnvelopeDto> SendWithMultipleSignersAsync(List<SignerDto> signers, string subject);
        Task<EnvelopeDto> SendWithFormFieldsAsync(string signerEmail, string signerName, string subject);
        Task<string> CreateEmbeddedSigningUrlAsync(string envelopeId, string email, string name);
        Task<byte[]> DownloadSignedDocumentAsync(string envelopeId, string documentId);
        Task<List<EnvelopeDto>> ListEnvelopesAsync(int days = 30, string? status = null);
        Task<EnvelopeDto> AddSignerToEnvelopeAsync(string envelopeId, SignerDto newSigner);
        Task<EnvelopeDto> CreateDraftEnvelopeAsync(string signerEmail, string signerName, string subject);
        Task<List<DocumentDto>> ListEnvelopeDocumentsAsync(string envelopeId);
        Task<EnvelopeDto> GetEnvelopeAsync(string envelopeId);
    }

    public interface IDocuSignDocumentService
    {
        Task<byte[]> ConvertDocumentToBase64Async(string filePath);
        Task SaveSignedDocumentAsync(string fileName, byte[] content);
        bool DocumentExists(string fileName);
        string GetDefaultDocumentPath();
    }

    // ==================== EXCEPTIONS ====================
    public class DocuSignException : Exception
    {
        public DocuSignException(string message) : base(message) { }
        public DocuSignException(string message, Exception innerException) : base(message, innerException) { }
    }

    public class DocuSignAuthException : DocuSignException
    {
        public DocuSignAuthException(string message) : base(message) { }
        public DocuSignAuthException(string message, Exception innerException) : base(message, innerException) { }
    }

    public class DocuSignApiException : DocuSignException
    {
        public int? StatusCode { get; }
        
        public DocuSignApiException(string message, int? statusCode = null) : base(message)
        {
            StatusCode = statusCode;
        }
    }

    // ==================== SERVICES ====================
    public class DocuSignAuthService : IDocuSignAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly ILogger<DocuSignAuthService> _logger;
        private string? _accessToken;
        private DateTime? _tokenExpiry;

        public DocuSignAuthService(
            IConfiguration configuration,
            HttpClient httpClient,
            ILogger<DocuSignAuthService> logger)
        {
            _configuration = configuration;
            _httpClient = httpClient;
            _logger = logger;
        }

        private string GetConfigValue(string key)
        {
            return _configuration[$"DocuSign:{key}"] ?? 
                   throw new InvalidOperationException($"Configuration manquante: DocuSign:{key}");
        }

        public string GetAuthorizationUrl()
        {
            var integratorKey = GetConfigValue("IntegratorKey");
            var redirectUri = GetConfigValue("RedirectUri");
            var authServer = GetConfigValue("AuthServer");

            var queryParams = HttpUtility.ParseQueryString(string.Empty);
            queryParams["response_type"] = "code";
            queryParams["scope"] = "signature";
            queryParams["client_id"] = integratorKey;
            queryParams["redirect_uri"] = redirectUri;

            return $"{authServer}/oauth/auth?{queryParams}";
        }

        public async Task<DocuSignAuthDto> ExchangeCodeForTokenAsync(string code)
        {
            try
            {
                var integratorKey = GetConfigValue("IntegratorKey");
                var clientSecret = GetConfigValue("ClientSecret");
                var redirectUri = GetConfigValue("RedirectUri");
                var authServer = GetConfigValue("AuthServer");

                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("grant_type", "authorization_code"),
                    new KeyValuePair<string, string>("code", code),
                    new KeyValuePair<string, string>("redirect_uri", redirectUri)
                });

                var authHeader = Convert.ToBase64String(
                    Encoding.UTF8.GetBytes($"{integratorKey}:{clientSecret}")
                );

                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authHeader);

                var response = await _httpClient.PostAsync(
                    $"{authServer}/oauth/token",
                    content
                );

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Échec de l'authentification DocuSign: {StatusCode} - {Error}", 
                        response.StatusCode, errorContent);
                    throw new DocuSignAuthException($"Échec de l'authentification: {response.StatusCode}");
                }

                var json = await response.Content.ReadAsStringAsync();
                var authResult = JsonConvert.DeserializeObject<DocuSignAuthDto>(json);
                
                if (authResult == null || string.IsNullOrEmpty(authResult.AccessToken))
                {
                    throw new DocuSignAuthException("Réponse d'authentification invalide");
                }
                
                _accessToken = authResult.AccessToken;
                _tokenExpiry = DateTime.UtcNow.AddSeconds(authResult.ExpiresIn - 300);
                
                _logger.LogInformation("Authentification DocuSign réussie, token expirera à {Expiry}", _tokenExpiry);
                return authResult;
            }
            catch (Exception ex) when (ex is not DocuSignAuthException)
            {
                _logger.LogError(ex, "Erreur lors de l'échange du code d'autorisation");
                throw new DocuSignAuthException("Échec de l'échange du code d'autorisation", ex);
            }
        }

        public bool IsAuthenticated()
        {
            return !string.IsNullOrEmpty(_accessToken) && 
                   (_tokenExpiry == null || DateTime.UtcNow < _tokenExpiry);
        }

        public string? GetAccessToken()
        {
            if (!IsAuthenticated())
            {
                _logger.LogWarning("Tentative d'accès au token non authentifié ou expiré");
                return null;
            }
            return _accessToken;
        }

        public void SetAccessToken(string token)
        {
            _accessToken = token;
            _tokenExpiry = DateTime.UtcNow.AddHours(1);
            _logger.LogInformation("Token DocuSign défini manuellement");
        }

        public void ClearAuthentication()
        {
            _accessToken = null;
            _tokenExpiry = null;
            _logger.LogInformation("Authentification DocuSign effacée");
        }
    }

    public class DocuSignEnvelopeService : IDocuSignEnvelopeService
    {
        private readonly IConfiguration _configuration;
        private readonly IDocuSignAuthService _authService;
        private readonly IDocuSignDocumentService _documentService;
        private readonly ILogger<DocuSignEnvelopeService> _logger;

        public DocuSignEnvelopeService(
            IConfiguration configuration,
            IDocuSignAuthService authService,
            IDocuSignDocumentService documentService,
            ILogger<DocuSignEnvelopeService> logger)
        {
            _configuration = configuration;
            _authService = authService;
            _documentService = documentService;
            _logger = logger;
        }

        private string GetConfigValue(string key)
        {
            return _configuration[$"DocuSign:{key}"] ?? 
                   throw new InvalidOperationException($"Configuration manquante: DocuSign:{key}");
        }

        private DocuSignClient GetDocuSignClient()
        {
            var token = _authService.GetAccessToken();
            if (string.IsNullOrEmpty(token))
            {
                throw new DocuSignAuthException("Non authentifié. Veuillez vous connecter à DocuSign.");
            }

            var basePath = GetConfigValue("BasePath");
            var authServer = GetConfigValue("AuthServer");

            var docuSignClient = new DocuSignClient();
            docuSignClient.SetOAuthBasePath(authServer);
            docuSignClient.Configuration.DefaultHeader.Add("Authorization", $"Bearer {token}");
            docuSignClient.Configuration.BasePath = basePath;
            
            return docuSignClient;
        }

        private EnvelopesApi GetEnvelopesApi()
        {
            var docuSignClient = GetDocuSignClient();
            return new EnvelopesApi(docuSignClient);
        }

        public async Task<EnvelopeDto> SendSimpleDocumentAsync(string signerEmail, string signerName, string subject)
        {
            try
            {
                var envelopesApi = GetEnvelopesApi();
                var accountId = GetConfigValue("AccountId");

                var documentPath = _documentService.GetDefaultDocumentPath();
                if (!_documentService.DocumentExists(documentPath))
                {
                    throw new FileNotFoundException($"Document non trouvé: {documentPath}");
                }

                var documentBytes = await _documentService.ConvertDocumentToBase64Async(documentPath);
                var documentBase64 = Convert.ToBase64String(documentBytes);

                var envelopeDefinition = new EnvelopeDefinition
                {
                    EmailSubject = subject ?? "Veuillez signer ce document",
                    Documents = new List<Document>
                    {
                        new Document
                        {
                            DocumentBase64 = documentBase64,
                            Name = "Document à signer",
                            FileExtension = "pdf",
                            DocumentId = "1"
                        }
                    },
                    Recipients = new Recipients
                    {
                        Signers = new List<Signer>
                        {
                            new Signer
                            {
                                Email = signerEmail,
                                Name = signerName,
                                RecipientId = "1",
                                Tabs = new Tabs
                                {
                                    SignHereTabs = new List<SignHere>
                                    {
                                        new SignHere
                                        {
                                            DocumentId = "1",
                                            PageNumber = "1",
                                            XPosition = "100",
                                            YPosition = "150"
                                        }
                                    }
                                }
                            }
                        }
                    },
                    Status = "sent"
                };

                var result = await envelopesApi.CreateEnvelopeAsync(accountId, envelopeDefinition);

                return new EnvelopeDto
                {
                    EnvelopeId = result.EnvelopeId,
                    Status = result.Status,
                    EmailSubject = subject ?? "Veuillez signer ce document",
                    CreatedDateTime = DateTime.UtcNow,
                    Signers = new List<SignerDto>
                    {
                        new SignerDto 
                        { 
                            Email = signerEmail, 
                            Name = signerName,
                            RecipientId = "1",
                            Status = "sent"
                        }
                    }
                };
            }
            catch (ApiException ex)
            {
                _logger.LogError(ex, "Erreur API DocuSign lors de l'envoi du document simple");
                throw new DocuSignApiException($"Échec de l'envoi du document: {ex.Message}", ex.ErrorCode);
            }
            catch (Exception ex) when (ex is not DocuSignException)
            {
                _logger.LogError(ex, "Erreur inattendue lors de l'envoi du document simple");
                throw new DocuSignException("Échec de l'envoi du document", ex);
            }
        }

        public async Task<string> CreateEmbeddedSigningUrlAsync(string envelopeId, string email, string name)
        {
            try
            {
                var envelopesApi = GetEnvelopesApi();
                var accountId = GetConfigValue("AccountId");
                var redirectUri = GetConfigValue("RedirectUri");

                var viewRequest = new RecipientViewRequest
                {
                    ReturnUrl = $"{redirectUri}/signing-complete",
                    AuthenticationMethod = "none",
                    Email = email,
                    UserName = name,
                    ClientUserId = "1001"
                };

                var viewResult = await envelopesApi.CreateRecipientViewAsync(
                    accountId,
                    envelopeId,
                    viewRequest
                );

                _logger.LogInformation("URL embedded créée pour l'enveloppe {EnvelopeId}", envelopeId);
                return viewResult.Url;
            }
            catch (ApiException ex)
            {
                _logger.LogError(ex, "Erreur API DocuSign lors de la création de l'URL embedded");
                throw new DocuSignApiException($"Échec de la création de l'URL de signature: {ex.Message}", ex.ErrorCode);
            }
        }

        public async Task<byte[]> DownloadSignedDocumentAsync(string envelopeId, string documentId)
        {
            try
            {
                var envelopesApi = GetEnvelopesApi();
                var accountId = GetConfigValue("AccountId");

                _logger.LogInformation("Téléchargement du document {DocumentId} de l'enveloppe {EnvelopeId}", 
                    documentId, envelopeId);

                var documentStream = await envelopesApi.GetDocumentAsync(
                    accountId,
                    envelopeId,
                    documentId
                );

                using var memoryStream = new MemoryStream();
                await documentStream.CopyToAsync(memoryStream);
                var documentBytes = memoryStream.ToArray();

                _logger.LogInformation("Document téléchargé: {Size} bytes", documentBytes.Length);
                return documentBytes;
            }
            catch (ApiException ex)
            {
                _logger.LogError(ex, "Erreur API DocuSign lors du téléchargement du document");
                throw new DocuSignApiException($"Échec du téléchargement du document: {ex.Message}", ex.ErrorCode);
            }
        }

        public async Task<List<EnvelopeDto>> ListEnvelopesAsync(int days = 30, string? status = null)
        {
            try
            {
                var envelopesApi = GetEnvelopesApi();
                var accountId = GetConfigValue("AccountId");

                var fromDate = DateTime.UtcNow.AddDays(-days).ToString("o");
                
                var options = new EnvelopesApi.ListStatusChangesOptions
                {
                    fromDate = fromDate,
                    status = status
                };

                var result = await envelopesApi.ListStatusChangesAsync(accountId, options);

                var envelopes = new List<EnvelopeDto>();
                
                if (result.Envelopes != null)
                {
                    foreach (var env in result.Envelopes)
                    {
                        envelopes.Add(new EnvelopeDto
                        {
                            EnvelopeId = env.EnvelopeId,
                            Status = env.Status,
                            EmailSubject = env.EmailSubject ?? "Sans sujet",
                            CreatedDateTime = DateTime.Parse(env.CreatedDateTime),
                            Signers = new List<SignerDto>()
                        });
                    }
                }

                _logger.LogInformation("{Count} enveloppes récupérées", envelopes.Count);
                return envelopes;
            }
            catch (ApiException ex)
            {
                _logger.LogError(ex, "Erreur API DocuSign lors de la récupération des enveloppes");
                throw new DocuSignApiException($"Échec de la récupération des enveloppes: {ex.Message}", ex.ErrorCode);
            }
        }

        public async Task<List<DocumentDto>> ListEnvelopeDocumentsAsync(string envelopeId)
        {
            try
            {
                var envelopesApi = GetEnvelopesApi();
                var accountId = GetConfigValue("AccountId");

                var docsList = await envelopesApi.ListDocumentsAsync(accountId, envelopeId);

                var documents = new List<DocumentDto>();
                
                if (docsList.EnvelopeDocuments != null)
                {
                    foreach (var doc in docsList.EnvelopeDocuments)
                    {
                        documents.Add(new DocumentDto
                        {
                            DocumentId = doc.DocumentId,
                            Name = doc.Name ?? "Document sans nom",
                            Type = doc.Type ?? "content"
                        });
                    }
                }

                _logger.LogInformation("{Count} documents récupérés pour l'enveloppe {EnvelopeId}", 
                    documents.Count, envelopeId);
                return documents;
            }
            catch (ApiException ex)
            {
                _logger.LogError(ex, "Erreur API DocuSign lors de la récupération des documents");
                throw new DocuSignApiException($"Échec de la récupération des documents: {ex.Message}", ex.ErrorCode);
            }
        }

        public async Task<EnvelopeDto> GetEnvelopeAsync(string envelopeId)
        {
            try
            {
                var envelopesApi = GetEnvelopesApi();
                var accountId = GetConfigValue("AccountId");

                var envelope = await envelopesApi.GetEnvelopeAsync(accountId, envelopeId);

                var envelopeDto = new EnvelopeDto
                {
                    EnvelopeId = envelope.EnvelopeId,
                    Status = envelope.Status,
                    EmailSubject = envelope.EmailSubject ?? "Sans sujet",
                    CreatedDateTime = DateTime.Parse(envelope.CreatedDateTime)
                };

                // Récupérer les signataires
                var recipients = await envelopesApi.ListRecipientsAsync(accountId, envelopeId);
                if (recipients.Signers != null)
                {
                    foreach (var signer in recipients.Signers)
                    {
                        envelopeDto.Signers.Add(new SignerDto
                        {
                            Email = signer.Email,
                            Name = signer.Name,
                            RecipientId = signer.RecipientId,
                            RoutingOrder = signer.RoutingOrder != null ? 
                                int.Parse(signer.RoutingOrder) : 1,
                            Status = signer.Status,
                            SignedDateTime = signer.SignedDateTime != null ? 
                                DateTime.Parse(signer.SignedDateTime) : null
                        });
                    }
                }

                _logger.LogInformation("Enveloppe {EnvelopeId} récupérée: {Status}", 
                    envelopeId, envelope.Status);
                return envelopeDto;
            }
            catch (ApiException ex)
            {
                _logger.LogError(ex, "Erreur API DocuSign lors de la récupération de l'enveloppe");
                throw new DocuSignApiException($"Échec de la récupération de l'enveloppe: {ex.Message}", ex.ErrorCode);
            }
        }

        // Implémentations des autres méthodes...
        public Task<EnvelopeDto> SendWithMultipleSignersAsync(List<SignerDto> signers, string subject)
        {
            throw new NotImplementedException();
        }

        public Task<EnvelopeDto> SendWithFormFieldsAsync(string signerEmail, string signerName, string subject)
        {
            throw new NotImplementedException();
        }

        public Task<EnvelopeDto> AddSignerToEnvelopeAsync(string envelopeId, SignerDto newSigner)
        {
            throw new NotImplementedException();
        }

        public Task<EnvelopeDto> CreateDraftEnvelopeAsync(string signerEmail, string signerName, string subject)
        {
            throw new NotImplementedException();
        }
    }

    public class DocuSignDocumentService : IDocuSignDocumentService
    {
        private readonly ILogger<DocuSignDocumentService> _logger;
        private readonly string _documentsFolder;
        private readonly string _signedDocumentsFolder;

        public DocuSignDocumentService(
            ILogger<DocuSignDocumentService> logger,
            IConfiguration configuration)
        {
            _logger = logger;
            
            // Configuration des dossiers directement depuis appsettings
            _documentsFolder = configuration["DocuSign:DocumentsFolder"] ?? "Documents";
            _signedDocumentsFolder = configuration["DocuSign:SignedDocumentsFolder"] ?? "DocumentsSignes";
            
            // Créer les dossiers s'ils n'existent pas
            EnsureDirectoriesExist();
        }

        private void EnsureDirectoriesExist()
        {
            if (!Directory.Exists(_documentsFolder))
            {
                Directory.CreateDirectory(_documentsFolder);
                _logger.LogInformation("Dossier créé: {Folder}", _documentsFolder);
            }
            
            if (!Directory.Exists(_signedDocumentsFolder))
            {
                Directory.CreateDirectory(_signedDocumentsFolder);
                _logger.LogInformation("Dossier créé: {Folder}", _signedDocumentsFolder);
            }
        }

        public async Task<byte[]> ConvertDocumentToBase64Async(string filePath)
        {
            try
            {
                if (!File.Exists(filePath))
                {
                    throw new FileNotFoundException($"Fichier non trouvé: {filePath}");
                }

                var bytes = await File.ReadAllBytesAsync(filePath);
                _logger.LogDebug("Document chargé: {FilePath}, {Size} bytes", filePath, bytes.Length);
                return bytes;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la lecture du document: {FilePath}", filePath);
                throw new DocuSignException($"Erreur lors de la lecture du document: {ex.Message}", ex);
            }
        }

        public async Task SaveSignedDocumentAsync(string fileName, byte[] content)
        {
            try
            {
                var filePath = Path.Combine(_signedDocumentsFolder, fileName);
                await File.WriteAllBytesAsync(filePath, content);
                _logger.LogInformation("Document signé sauvegardé: {FilePath}, {Size} bytes", 
                    filePath, content.Length);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de la sauvegarde du document signé: {FileName}", fileName);
                throw new DocuSignException($"Erreur lors de la sauvegarde du document: {ex.Message}", ex);
            }
        }

        public bool DocumentExists(string fileName)
        {
            var filePath = Path.Combine(_documentsFolder, fileName);
            var exists = File.Exists(filePath);
            
            if (!exists)
            {
                _logger.LogWarning("Document non trouvé: {FilePath}", filePath);
            }
            
            return exists;
        }

        public string GetDefaultDocumentPath()
        {
            return Path.Combine(_documentsFolder, "document.pdf");
        }

        public string GetSignedDocumentPath(string fileName)
        {
            return Path.Combine(_signedDocumentsFolder, fileName);
        }
    }

    // ==================== EXTENSIONS ====================
    public static class DocuSignServiceExtensions
    {
        public static IServiceCollection AddDocuSignServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Vérifier que la configuration DocuSign existe
            var docuSignConfig = configuration.GetSection("DocuSign");
            if (!docuSignConfig.Exists())
            {
                throw new InvalidOperationException("Configuration DocuSign manquante dans appsettings.json");
            }

            // Services HTTP
            services.AddHttpClient<DocuSignAuthService>();

            // Services métier
            services.AddScoped<IDocuSignAuthService, DocuSignAuthService>();
            services.AddScoped<IDocuSignEnvelopeService, DocuSignEnvelopeService>();
            services.AddScoped<IDocuSignDocumentService, DocuSignDocumentService>();

            return services;
        }

        public static string FormatBytes(this long bytes)
        {
            string[] sizes = { "Bytes", "KB", "MB", "GB" };
            double len = bytes;
            int order = 0;
            
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len /= 1024;
            }
            
            return $"{len:0.##} {sizes[order]}";
        }
    }
}