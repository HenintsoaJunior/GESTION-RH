namespace MyApp.Api.Models.search;

public class RecruitmentRequestSearchFiltersDTO
{
    public string? Status { get; set; }
    public string? PositionTitle { get; set; }
    public DateTime? RequestDateMin { get; set; }
    public DateTime? RequestDateMax { get; set; }
    public string? SiteId { get; set; }
    public string? ContractTypeId { get; set; }
    public string? DirectionId { get; set; }
    public string? DepartmentId { get; set; }
    public string? ServiceId { get; set; }
}