namespace MyApp.Api.Models.dto.mission
{
    public class GeneratePaiementDTO
    {
        public string? MissionId { get; set; }
        public string? EmployeeId { get; set; }
        public string? DirectionId { get; set; }
        
        public string? LieuId { get; set; }
        
        public string? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}