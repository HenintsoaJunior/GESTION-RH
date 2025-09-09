namespace MyApp.Api.Models.dto.mission;

public class MissionBudgetDTOForm
{
    public string DirectionName { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public string UserId { get; set; } = string.Empty;
}