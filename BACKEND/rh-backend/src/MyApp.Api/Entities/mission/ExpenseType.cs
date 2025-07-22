using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.mission
{
    [Table("expense_type")]
    public class ExpenseType : Types
    {
        [Key]
        [Column("expense_type_id")]
        [MaxLength(50)]
        public string ExpenseTypeId { get; set; } = null!;
    }
}
