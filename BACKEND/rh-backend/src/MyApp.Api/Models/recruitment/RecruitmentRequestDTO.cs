using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.recruitment;
namespace MyApp.Api.Models.recruitment
{
    public class RecruitmentRequestDTO
    {
        public RecruitmentRequest RecruitmentRequest { get; set; } = null!;
        public RecruitmentApproval RecruitmentApproval { get; set; } = null!;
        public IEnumerable<RecruitmentRequestReplacementReason>? ReplacementReasons { get; set; } = null;
        public IEnumerable<ApprovalFlow>? ApprovalFlows { get; set; } = null;
    }
}
