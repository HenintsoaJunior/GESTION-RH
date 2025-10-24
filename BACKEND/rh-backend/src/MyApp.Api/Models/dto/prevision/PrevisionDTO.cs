using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.prevision;

public class PrevisionPriceDtoForm
{
    [Required]
    public decimal Amount { get; set; }

    [Required]
    public DateTime DepartureDate { get; set; }
}

public class PrevisionPriceDeleteDto
{
}