using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.employee;

namespace MyApp.Api.Entities.employee
{
    [Table("employee_categories")]
    public class EmployeeCategory : CodeLabel
    {
        [Key]
        [Column("employee_category_id")]
        [MaxLength(50)]
        public string EmployeeCategoryId { get; set; } = null!;

        public EmployeeCategory()
        {
        }

        public EmployeeCategory(CreateEmployeeCategoryDTO dto)
        {
            Code = dto.Code ?? throw new ArgumentNullException(nameof(dto.Code));
            Label = dto.Label ?? throw new ArgumentNullException(nameof(dto.Label));
        }
    }
}