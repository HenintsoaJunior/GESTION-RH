using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.form.employee
{
    public class ApprovalFlowDTOForm
    {
        [Required]
        public int ApprovalOrder { get; set; }

        [MaxLength(50)]
        public string? ApproverRole { get; set; }

    }
}
