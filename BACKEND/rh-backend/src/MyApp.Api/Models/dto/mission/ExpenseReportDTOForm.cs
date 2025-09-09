namespace MyApp.Api.Models.dto.mission
{
    public class ExpenseReportDTOForm
    {
        public string Titled { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Type { get; set; } = string.Empty; // CB / ESP
        public string CurrencyUnit { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Rate { get; set; }
        
        // Relations
        public string AssignationId { get; set; } = string.Empty;
        public string ExpenseReportTypeId { get; set; } = string.Empty;

        public string UserId { get; set; } = string.Empty; // pour logs
    }
}