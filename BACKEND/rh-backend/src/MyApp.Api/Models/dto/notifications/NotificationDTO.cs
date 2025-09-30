namespace MyApp.Api.Models.dto.notifications
{
    public class NotificationFormDTO
    {
        public string Title { get; set; } = default!;
        public string Message { get; set; } = default!;
        public string Type { get; set; } = default!;
        public string? RelatedTable { get; set; }
        public string? RelatedMenu { get; set; }
        public string? RelatedId { get; set; }
        public int Priority { get; set; } = 1;
        public List<string> UserIds { get; set; } = new List<string>();
        public DateTime? CreatedAt { get; set; }
    }
}