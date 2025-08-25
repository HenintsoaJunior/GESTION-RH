namespace MyApp.Api.Models.dto.application
{
    public class ApplicationCommentDTOForm
    {
        public string CommentText { get; set; } = string.Empty;
        public string ApplicationId { get; set; } = null!;
        public string UserId { get; set; } = null!;
    }
}