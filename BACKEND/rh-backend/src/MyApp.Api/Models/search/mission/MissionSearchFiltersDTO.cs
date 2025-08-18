namespace MyApp.Api.Models.search.mission
{
    public class MissionSearchFiltersDTO
    {
        public string? Name { get; set; }
        public DateTime? StartDate { get; set; } // Changé de StartDateMin à StartDate
        public DateTime? EndDate { get; set; }   // Changé de StartDateMax à EndDate
        public string? LieuId { get; set; }
        public string? Status { get; set; }
    }

}