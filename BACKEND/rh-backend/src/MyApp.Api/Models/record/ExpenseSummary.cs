namespace MyApp.Api.Models.record
{
    public record ExpenseSummary(
        string MissionId,
        string MissionTitled,   
        string Status,
        string EmployeeName,
        string EmployeeId,
        string EmployeeCode,
        string LieuName,
        DateTime CreatedAt,
        decimal TotalAmount
    );
}