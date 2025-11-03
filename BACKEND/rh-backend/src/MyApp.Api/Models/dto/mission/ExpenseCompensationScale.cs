using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.mission
{
    public class ExpenseCompensationScaleDTOForm
    {
        public decimal Amount { get; set; }
        public int IsTransport { get; set; }
        public string? Devise { get; set; }
        public string? ExpenseTypeId { get; set; }
        public string ZoneId { get; set; } = null!;
        public string UserId { get; set; } = null!;
    }

    public class BulkExpenseCompensationScaleDTO
    {
        [Required(ErrorMessage = "Amount is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Amount must be greater than or equal to 0")]
        public decimal Amount { get; set; }

        public int IsTransport { get; set; }

        public string? Devise { get; set; }

        public string? ExpenseTypeId { get; set; }

        public string ZoneId { get; set; } = null!;
    }

    public class BulkExpenseCompensationScaleSyncRequest
    {
        [Required(ErrorMessage = "Expense compensation scales are required")]
        public List<BulkExpenseCompensationScaleDTO> ExpenseCompensationScales { get; set; } = new List<BulkExpenseCompensationScaleDTO>();
    }
}