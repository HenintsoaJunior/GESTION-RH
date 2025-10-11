namespace MyApp.Api.Models.dto.mission
{
    public class MissionReportDTOForm
    {
        public string Text { get; set; } = string.Empty;
        public string UserId { get; set; } = null!;
        public string AssignationId { get; set; } = null!;
    }
}