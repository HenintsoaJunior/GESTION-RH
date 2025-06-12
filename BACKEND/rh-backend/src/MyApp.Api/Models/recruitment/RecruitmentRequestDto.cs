namespace MyApp.Api.Models.recruitment
{
    public class RecruitmentRequestDto
    {
        public string? RecruitmentRequestId { get; set; }
        public string? JobTitle { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }

        public string? RequesterName { get; set; }  // enrichi à partir de la relation
        public DateTime RequestDate { get; set; }
        public DateTime ApprovalDate { get; set; }
    }
}
