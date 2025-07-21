using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using MyApp.Api.Entities.employee;

namespace MyApp.Api.Entities.recruitment
{
    [Table("approval_flow_employee")]
    [PrimaryKey(nameof(EmployeeId), nameof(ApprovalFlowId))]
    public class ApprovalFlowEmployee
    {
        [Column("employee_id", Order = 0)]
        [MaxLength(50)]
        public string EmployeeId { get; set; } = null!;

        [Column("approval_flow_id", Order = 1)]
        [MaxLength(50)]
        public string ApprovalFlowId { get; set; } = null!;

        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }

        [ForeignKey("ApprovalFlowId")]
        public ApprovalFlow? ApprovalFlow { get; set; }
    }
}