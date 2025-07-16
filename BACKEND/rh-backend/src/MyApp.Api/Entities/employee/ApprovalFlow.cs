using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.employee
{
    public class ApprovalFlow : BaseEntity
    {
        [Key]
        [Column("approval_flow_id")]
        public string ApprovalFlowId { get; set; } = null!;

        [Column("approval_order")]
        [Required]
        public int ApprovalOrder { get; set; }

        [Column("approver_role")]
        [MaxLength(50)]
        public string? ApproverRole { get; set; }

        [Required]
        [Column("approver_id")]
        public string? ApproverId { get; set; }

        // Navigation
        [ForeignKey("ApproverId")]
        public Employee? Approver { get; set; }
    }
}
