namespace MyApp.Api.Models.dto.mission
{
    public class MissionValidationSearchFiltersDTO
    {
        public string? MissionId { get; set; }
        public string? MissionAssignationId { get; set; }
        public string? MissionCreator { get; set; }
        public string? Status { get; set; }
        public string? ToWhom { get; set; }
        public DateTime? ValidationDate { get; set; }
    }
    public class MissionValidationDTOForm
    {
        public string MissionId { get; set; } = null!;
        public string MissionAssignationId { get; set; } = null!;
        public string MissionCreator { get; set; } = null!;
        public string? Status { get; set; } = "En Attente";
        public string? ToWhom { get; set; }
        public DateTime? ValidationDate { get; set; }
    }
    
    public class MissionValidationStats
    {
        public int Total { get; set; }
        public int EnAttente { get; set; }
        public int Approuve { get; set; }
        public int Rejete { get; set; }
    }
}