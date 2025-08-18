using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.employee
{
    [Table("approval_flow")]
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
        
        
    }
}
