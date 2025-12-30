using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.prevision;

public class PrevisionPriceDtoForm
{
    [Required]
    public decimal Amount { get; set; }

    [Required]
    public DateTime DepartureDate { get; set; }
    [Required]
    public int IsPaid { get; set; } // 0 = non payé,
    
    [Required]
    public string MissionId { get; set; } = null!;
}

public class PrevisionPriceDeleteDto
{
}