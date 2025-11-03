using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.compensation_scale
{
    public class BulkCompensationScaleDTO
    {
        [Required(ErrorMessage = "Amount is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Amount must be greater than or equal to 0")]
        public decimal Amount { get; set; }

        public string? Place { get; set; }

        public string? TransportId { get; set; }

        public string? ExpenseTypeId { get; set; }
    }

    public class BulkCompensationScaleSyncRequest
    {
        [Required(ErrorMessage = "Category IDs are required")]
        public List<string> CategoryIds { get; set; } = new List<string>();

        [Required(ErrorMessage = "Compensation scales are required")]
        public List<BulkCompensationScaleDTO> CompensationScales { get; set; } = new List<BulkCompensationScaleDTO>();
    }
}