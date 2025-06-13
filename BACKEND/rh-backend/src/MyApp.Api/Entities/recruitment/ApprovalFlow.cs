using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using MyApp.Api.Entities.departments;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.recruitment
{
    [Table("approval_flow")]
    public class ApprovalFlow
    {
        [Key]
        [Column("approval_flow_id")]
        [MaxLength(50)]
        public string ApprovalFlowId { get; set; } = null!;

        [Column("approval_order")]
        public int ApprovalOrder { get; set; }

        [Required]
        [Column("department_id")]
        [MaxLength(50)]
        public string DepartmentId { get; set; } = null!;

        [ForeignKey("DepartmentId")]
        public Department? Department { get; set; }
    }
}
