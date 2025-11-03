using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Entities.mission
{
    [Table("compensation_scale")]
    public class CompensationScale : BaseEntity
    {
        [Key]
        [Column("compensation_scale_id")]
        [MaxLength(50)]
        public string CompensationScaleId { get; set; } = null!;

        [Column("amount", TypeName = "decimal(15,2)")]
        public decimal Amount { get; set; }
        
        [Column("transport_id")]
        [MaxLength(50)]
        public string? TransportId { get; set; }
        
        [Column("expense_type_id")]
        [MaxLength(50)]
        public string? ExpenseTypeId { get; set; }

        [ForeignKey("TransportId")]
        public Transport? Transport { get; set; }

        [ForeignKey("ExpenseTypeId")]
        public ExpenseType? ExpenseType { get; set; }
        
        public CompensationScale(){}

        public CompensationScale(CompensationScaleDTOForm compensationScaleDtoForm)
        {
            Amount = compensationScaleDtoForm.Amount;
            TransportId = compensationScaleDtoForm.TransportId;
            ExpenseTypeId = compensationScaleDtoForm.ExpenseTypeId;
        }
    }
}
