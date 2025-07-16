using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Models.form.recruitment;
namespace MyApp.Api.Models.recruitment
{
    public class RecruitmentRequestDTOform
    {
        public RecruitmentRequest RecruitmentRequest { get; set; } = null!;
        public RecruitmentApprovalDTOform RecruitmentApproval { get; set; } = null!;
        // public IEnumerable<RecruitmentRequestReplacementReason>? ReplacementReasons { get; set; } = null;
        // public IEnumerable<ApprovalFlow>? ApprovalFlows { get; set; } = null;
    }
}
