namespace MyApp.Api.Models.search.employee;

public class EmployeeSearchFiltersDTO
{
    public string? JobTitle { get; set; }
    public string? LastName { get; set; }
    public string? FirstName { get; set; }
    public string? DirectionId { get; set; }
    public string? ContractTypeId { get; set; }
    public string? EmployeeCode { get; set; }
    public string? SiteId { get; set; }
    public string? Status { get; set; }
    public string? GenderId { get; set; }
    public DateTime? DepartureDateMin { get; set; }
    public DateTime? DepartureDateMax { get; set; }
}