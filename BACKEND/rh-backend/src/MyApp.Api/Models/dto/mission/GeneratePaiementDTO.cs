namespace MyApp.Api.Models.dto.mission
{
    public class GeneratePaiementDTO
    {
        public string? MissionId { get; set; }
        public string? EmployeeId { get; set; }
    }

     public class GenerateOMDTO
    {
        public required string MissionId { get; set; }
        public required string EmployeeId { get; set; }
    }
}