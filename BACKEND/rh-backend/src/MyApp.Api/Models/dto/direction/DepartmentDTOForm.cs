namespace MyApp.Api.Models.dto.direction
{
    public class DepartmentDTOForm
    {
        public required string DepartmentName { get; set; }
        public required string DirectionId { get; set; }
    }


    public class DepartmentSearchFiltersDTO
    {
        public string? Name { get; set; }
        public string? DirectionId { get; set; }
    }
}
