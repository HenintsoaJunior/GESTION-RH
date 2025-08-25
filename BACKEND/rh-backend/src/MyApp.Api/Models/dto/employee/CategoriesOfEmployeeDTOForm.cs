namespace MyApp.Api.Models.dto.employee
{
    public class CategoriesOfEmployeeDTOForm
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string EmployeeCategoryId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
