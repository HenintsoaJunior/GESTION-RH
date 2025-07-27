namespace MyApp.Api.Models.classes.mission;

public class ExcelRowData
{
    public string Beneficiary { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public DateTime? Date { get; set; }
    public decimal Transport { get; set; }
    public decimal Breakfast { get; set; }
    public decimal Lunch { get; set; }
    public decimal Dinner { get; set; }
    public decimal Accommodation { get; set; }
    public decimal Total { get; set; }
}