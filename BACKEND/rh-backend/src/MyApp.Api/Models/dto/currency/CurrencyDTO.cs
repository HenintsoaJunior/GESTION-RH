namespace MyApp.Api.Models.dto.currency
{
    public class CurrencyRatesDto
    {
        public string? Base { get; set; } 
        public Dictionary<string, decimal> Rates { get; set; } = new Dictionary<string, decimal>();
    }

    public class ConvertedAmountDto
    {
        public decimal ConvertedAmount { get; set; }
    }
}