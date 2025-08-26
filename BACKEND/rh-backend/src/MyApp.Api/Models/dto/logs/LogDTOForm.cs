namespace MyApp.Api.Models.dto.logs
{
    public class LogDTOForm
    {
        public string Action { get; set; } = null!;
        public string? TableName { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string UserId { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}