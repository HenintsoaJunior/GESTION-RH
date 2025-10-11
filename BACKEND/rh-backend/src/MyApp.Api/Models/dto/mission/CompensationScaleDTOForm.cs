namespace MyApp.Api.Models.dto.mission
{
    public class CompensationScaleDTOForm
    {
        public decimal Amount { get; set; }
        public string Place { get; set; } = null!;
        public string TransportId { get; set; } = null!;
        public string ExpenseTypeId { get; set; } = null!;
        public string EmployeeCategoryId { get; set; } = null!;
        public string UserId { get; set; } = string.Empty; // pour logs
    }
}
