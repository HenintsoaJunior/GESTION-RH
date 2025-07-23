using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Entities.employee
{
    [Table("categories_of_employee")]
    public class CategoriesOfEmployee : BaseEntity
    {
        [Key, Column("employee_id", Order = 0)]
        [MaxLength(50)]
        public string EmployeeId { get; set; } = string.Empty;

        [Key, Column("employee_category_id", Order = 1)]
        [MaxLength(50)]
        public string EmployeeCategoryId { get; set; } = string.Empty;

        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }

        [ForeignKey("EmployeeCategoryId")]
        public EmployeeCategory? EmployeeCategory { get; set; }
    }
}
