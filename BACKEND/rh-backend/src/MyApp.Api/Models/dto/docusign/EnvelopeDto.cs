namespace MyApp.Api.Models.dto.docusign
{
    public class EnvelopeDto
    {
        public string EnvelopeId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string EmailSubject { get; set; } = string.Empty;
        public DateTime CreatedDateTime { get; set; }
        public List<SignerDto> Signers { get; set; } = new();
    }

    public class SignerDto
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string RecipientId { get; set; } = string.Empty;
        public int RoutingOrder { get; set; } = 1;
        public string Status { get; set; } = string.Empty;
        public DateTime? SignedDateTime { get; set; }
    }

    public class DocumentDto
    {
        public string DocumentId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public long Size { get; set; }
        public int? PageCount { get; set; }
    }

    public class SendDocumentRequestDto
    {
        public string EmailSubject { get; set; } = string.Empty;
        public List<SignerDto> Signers { get; set; } = new();
        public List<DocumentContentDto> Documents { get; set; } = new();
        public string Status { get; set; } = "sent";
    }

    public class DocumentContentDto
    {
        public string DocumentBase64 { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string FileExtension { get; set; } = string.Empty;
        public string DocumentId { get; set; } = string.Empty;
    }
}