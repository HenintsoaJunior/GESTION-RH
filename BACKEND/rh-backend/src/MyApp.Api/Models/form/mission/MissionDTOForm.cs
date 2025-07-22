namespace MyApp.Api.Models.form.mission
{
    public class MissionDTOForm
    {
        public string? MissionId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime? StartDate { get; set; }
        public string Site { get; set; } = null!;
    }
}
