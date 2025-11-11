namespace MyApp.Api.Models.record
{
    public record ExpenseSummary(
        string MissionId,
        string AssignationId,
        string MissionTitled,
        string Status,
        string EmployeeName,
        string EmployeeCode,
        string LieuName,
        DateTime CreatedAt,
        decimal TotalAmount
    );
}