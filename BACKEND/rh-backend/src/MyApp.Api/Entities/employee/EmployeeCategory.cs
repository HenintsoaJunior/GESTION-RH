using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.employee
{
    [Table("employee_categories")]
    public class EmployeeCategory : CodeLabel
    {
        [Key]
        [Column("employee_category_id")]
        [MaxLength(50)]
        public string EmployeeCategoryId { get; set; } = Guid.NewGuid().ToString();
    }
}
