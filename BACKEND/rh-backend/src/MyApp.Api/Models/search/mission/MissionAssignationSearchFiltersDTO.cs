namespace MyApp.Api.Models.search.mission
{
    public class MissionAssignationSearchFiltersDTO
    {
        public string? EmployeeId { get; set; }
        public string? MissionId { get; set; }
        public string? TransportId { get; set; }

        public string? LieuId { get; set; }
        public DateTime? DepartureDate { get; set; }
        public DateTime? DepartureArrive { get; set; }
        public string? Status { get; set; }
    }
}