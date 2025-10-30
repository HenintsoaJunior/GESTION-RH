namespace MyApp.Api.Models.dto.direction
{
    public class UnitDTOForm
    {
        public required string UnitName { get; set; }
        public required string ServiceId { get; set; }
    }

    public class UnitSearchFiltersDTO
    {
        public string? Name { get; set; }
        public string? ServiceId { get; set; }
    }
}