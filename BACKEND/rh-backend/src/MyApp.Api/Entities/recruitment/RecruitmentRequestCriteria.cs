namespace MyApp.Api.Entities.recruitment
{
    public class RecruitmentRequestCriteria : BaseEntity
    {
        public string? Status { get; set; }
        public string? JobTitleKeyword { get; set; }
        public DateTime? RequestDateMin { get; set; }
        public DateTime? RequestDateMax { get; set; }
        public DateTime? ApprovalDateMin { get; set; }
        public DateTime? ApprovalDateMax { get; set; }

        public void Validate()
        {
            if (RequestDateMin.HasValue && RequestDateMax.HasValue &&
                RequestDateMax.Value < RequestDateMin.Value)
                throw new ArgumentException("Date incorrect");

            if (ApprovalDateMin.HasValue && ApprovalDateMax.HasValue &&
                ApprovalDateMax.Value < ApprovalDateMin.Value)
                throw new ArgumentException("Date incorrect");
        }
    }
}
