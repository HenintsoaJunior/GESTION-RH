namespace MyApp.Api.Models.search.mission
{
    public class MissionAssignationSearchFiltersDTO
    {
        public string? EmployeeId { get; set; }
        public string? MissionId { get; set; }
        public string? TransportId { get; set; }
        public DateTime? DepartureDateMin { get; set; }
        public DateTime? DepartureDateMax { get; set; }
        public string? Status { get; set; }
    }
}