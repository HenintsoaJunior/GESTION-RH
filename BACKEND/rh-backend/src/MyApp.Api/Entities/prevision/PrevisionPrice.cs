using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.prevision;

namespace MyApp.Api.Entities.prevision;

[Table("prevision_price")]
public class PrevisionPrice : BaseEntity
{
    [Key]
    [Column("prevision_id")]
    [MaxLength(50)]
    public string PrevisionId { get; set; } = null!;

    [Column("amount")]
    public decimal Amount { get; set; }

    [Column("departure_date")]
    public DateTime DepartureDate { get; set; }

    public PrevisionPrice() { }

    public PrevisionPrice(PrevisionPriceDtoForm dto)
    {
        Amount = dto.Amount;
        DepartureDate = dto.DepartureDate;
    }
}