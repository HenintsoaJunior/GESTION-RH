using MyApp.Api.Entities.recruitment;

namespace MyApp.Api.Models.form.recruitment;

public class AddWithFlowsRequestDTO
{
    public RecruitmentApproval Approval { get; set; } = null!;
    public IEnumerable<ApprovalFlowEmployee> ApprovalFlows { get; set; } = null!;
}