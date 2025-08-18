
namespace MyApp.Api.Models.form.employee
{
    public class ApprovalFlowEmployeeDTOForm
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string ApprovalFlowId { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

    }
}
