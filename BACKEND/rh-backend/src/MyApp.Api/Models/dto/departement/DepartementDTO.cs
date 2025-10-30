
namespace MyApp.Api.Models.dto.departement
{
    public class DepartementDTO
    {
        public string DepartementId { get; set; } = null!;
        public string DepartementName { get; set; } = string.Empty;
        public string DirectionId { get; set; } = null!;
    }

    public class DepartementDTOForm
    {
        public string? DepartementName { get; set; }
        public string? DirectionId { get; set; }
    }

    public class DepartementSearchFiltersDTO
    {
        public string? Name { get; set; }
    }
}
