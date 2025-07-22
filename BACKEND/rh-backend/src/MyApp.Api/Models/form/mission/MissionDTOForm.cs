namespace MyApp.Api.Models.form.mission
{
    public class MissionDTO
    {
        public string? MissionId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public string SiteId { get; set; } = null!;
    }
}
