namespace MyApp.Api.Models.dto.docusign
{
    public class DocuSignSettings
    {
        public string IntegratorKey { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public string RedirectUri { get; set; } = string.Empty;
        public string AccountId { get; set; } = string.Empty;
        public string BasePath { get; set; } = string.Empty;
        public string AuthServer { get; set; } = string.Empty;
    }
}