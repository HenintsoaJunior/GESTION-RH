using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.recruitment
{
    public class RecruitmentRequestCriteria : BaseEntity
    {
        [Column("requester_id")]
        [MaxLength(50)]
        public string RequesterId { get; set; } = null!;
        [ForeignKey("RequesterId")]
        public User? Requester { get; set; } = null!;
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
