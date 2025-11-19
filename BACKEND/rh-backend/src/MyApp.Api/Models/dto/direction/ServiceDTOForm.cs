namespace MyApp.Api.Models.dto.direction
{
    public class ServiceDTOForm
    {
        public required string ServiceName { get; set; }
        public required string DepartmentId { get; set; }
    }

    public class ServiceSearchFiltersDTO
    {
        public string? Name { get; set; }

        public string? DepartmentId { get; set; }
    }
}
