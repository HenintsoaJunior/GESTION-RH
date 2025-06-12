using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.departments
{
    public class DepartmentDto
    {
        [Required]
        [MaxLength(50)]
        public string DepartmentId { get; set; } = default!;

        [Required]
        [MaxLength(100)]
        public string DepartmentName { get; set; } = default!;
    }
}