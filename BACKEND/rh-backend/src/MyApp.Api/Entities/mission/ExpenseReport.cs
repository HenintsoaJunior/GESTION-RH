using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Entities.mission
{
    [Table("expense_report")]
    public class ExpenseReport : BaseEntity
    {
        [Key]
        [Column("expense_report_id")]
        [MaxLength(50)]
        public string ExpenseReportId { get; set; } = null!;

        [Required]
        [Column("titled")]
        [MaxLength(250)]
        public string Titled { get; set; } = string.Empty;  // Corrigé : non-nullable avec initialisation pour cohérence avec [Required]

        [Column("description", TypeName = "text")]
        public string? Description { get; set; }

        [Required]
        [Column("type")]
        [MaxLength(50)]
        public string Type { get; set; } = string.Empty; // CB / ESP

        [Required]
        [Column("status")]
        [MaxLength(50)]
        public string? Status { get; set; }

        [Required]
        [Column("currency_unit")]
        [MaxLength(50)]
        public string CurrencyUnit { get; set; } = string.Empty;

        [Required]
        [Column("amount", TypeName = "decimal(15,2)")]
        public decimal Amount { get; set; } = 0m; 

        [Required]
        [Column("rate", TypeName = "decimal(15,2)")]
        public decimal Rate { get; set; } = 0m;

        // 🔑 Foreign Keys
        [Required]
        [Column("assignation_id")]
        [MaxLength(50)]
        public string AssignationId { get; set; } = string.Empty;  

        [ForeignKey("AssignationId")]
        public MissionAssignation? MissionAssignation { get; set; }

        [Required]
        [Column("expense_report_type_id")]
        [MaxLength(50)]
        public string ExpenseReportTypeId { get; set; } = string.Empty;  

        [ForeignKey("ExpenseReportTypeId")]
        public ExpenseReportType? ExpenseReportType { get; set; }
        
        public ExpenseReport() { }

        public ExpenseReport(ExpenseLineDTO dto)
        {
            Titled = dto.Titled ?? string.Empty;
            Description = dto.Description;
            Type = dto.Type ?? string.Empty;
            CurrencyUnit = dto.CurrencyUnit ?? string.Empty;
            Amount = dto.Amount;
            Rate = dto.Rate;
            Status = "pending";
            AssignationId = dto.AssignationId ?? string.Empty;
            ExpenseReportTypeId = dto.ExpenseReportTypeId ?? string.Empty;
        }
    }
}