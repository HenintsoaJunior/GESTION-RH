namespace MyApp.Api.Models.dto.docusign
{
    public class DocuSignAuthDto
    {
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public int ExpiresIn { get; set; }
        public string? TokenType { get; set; }
    }

    public class AuthRequestDto
    {
        public string? GrantType { get; set; }
        public string? Code { get; set; }
        public string? RedirectUri { get; set; }
    }
}