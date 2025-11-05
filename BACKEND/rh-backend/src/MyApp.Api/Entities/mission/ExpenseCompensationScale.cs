using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.zones;
using MyApp.Api.Models.dto.mission;
namespace MyApp.Api.Entities.mission
{
    [Table("expense_compensation_scale")]
    public class ExpenseCompensationScale : BaseEntity
    {
        [Key]
        [Column("expense_compensation_scale_id")]
        [MaxLength(50)]
        public string ExpenseCompensationScaleId { get; set; } = null!;

        [Column("amount", TypeName = "decimal(15,2)")]
        public decimal Amount { get; set; }
        
        [Column("devise")]
        [MaxLength(50)]
        [DefaultValue("EUR")]
        public string Devise { get; set; } = "EUR";
        
        [Column("expense_type_id")]
        [MaxLength(50)]
        public string? ExpenseTypeId { get; set; }
        
        [Column("zone_id")]
        [MaxLength(50)]
        public string ZoneId { get; set; } = null!;

        [ForeignKey("ExpenseTypeId")]
        public ExpenseType? ExpenseType { get; set; }

        [ForeignKey("ZoneId")]
        public GeoZone? Zone { get; set; }
        
        public ExpenseCompensationScale(){}

        public ExpenseCompensationScale(ExpenseCompensationScaleDTOForm expenseCompensationScaleDtoForm)
        {
            Amount = expenseCompensationScaleDtoForm.Amount;
            Devise = expenseCompensationScaleDtoForm.Devise ?? "EUR";
            ExpenseTypeId = expenseCompensationScaleDtoForm.ExpenseTypeId;
            ZoneId = expenseCompensationScaleDtoForm.ZoneId;
        }
    }
}