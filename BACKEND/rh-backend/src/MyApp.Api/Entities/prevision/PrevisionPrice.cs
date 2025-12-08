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

    [Column("is_paid")]
    public int IsPaid { get; set; } = 0; // 0 = non payé, 1 = payé

    [Column("mission_id")]
    [StringLength(50)]
    public string MissionId { get; set; } = null!;

    public PrevisionPrice() { }

    public PrevisionPrice(PrevisionPriceDtoForm dto)
    {
        Amount = dto.Amount;
        DepartureDate = dto.DepartureDate;
        IsPaid = dto.IsPaid; 
        MissionId = dto.MissionId;
    }
}