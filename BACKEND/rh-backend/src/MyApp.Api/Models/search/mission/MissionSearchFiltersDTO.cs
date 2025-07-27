namespace MyApp.Api.Models.search.mission
{
    public class MissionSearchFiltersDTO
    {
        public string? Name { get; set; }
        public DateTime? StartDateMin { get; set; }
        public DateTime? StartDateMax { get; set; }
        public string? LieuId { get; set; }
        
        public string? Status { get; set; }
    }
}
