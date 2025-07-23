namespace MyApp.Api.Models.form.employee
{
    public class CategoriesOfEmployeeDTOForm
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string EmployeeCategoryId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
