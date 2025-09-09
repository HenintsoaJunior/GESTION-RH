using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.mission
{
    [Table("expense_report_type")]
    public class ExpenseReportType : Types
    {
        [Key]
        [Column("expense_report_type_id")]
        [MaxLength(50)]
        public string ExpenseReportTypeId { get; set; } = null!;
        
    }
}