using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.recruitment;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.jobs;

namespace MyApp.Api.Entities.jobs
{
    [Table("job_offers")]
    public class JobOffer : BaseEntity
    {
        [Key]
        [Column("offer_id")]
        [MaxLength(50)]
        public string OfferId { get; set; } = null!;

        [Column("status")]
        [MaxLength(20)]
        public string? Status { get; set; }

        [Column("publication_date")]
        public DateTime? PublicationDate { get; set; }

        [Column("deadline_date")]
        public DateTime? DeadlineDate { get; set; }

        [Column("duration")]
        public int? Duration { get; set; }

        [Required]
        [Column("description_id")]
        [MaxLength(50)]
        public string DescriptionId { get; set; } = null!;

        [ForeignKey("DescriptionId")]
        public JobDescription? JobDescription { get; set; }

        [Required]
        [Column("recruitment_request_id")]
        [MaxLength(50)]
        public string RecruitmentRequestId { get; set; } = null!;

        [ForeignKey("RecruitmentRequestId")]
        public RecruitmentRequest? RecruitmentRequest { get; set; }

        [Column("requester_id")]
        public string? RequesterId { get; set; }

        [ForeignKey("RequesterId")]
        public User? Requester { get; set; }
        public JobOffer() { }
        public JobOffer(JobOfferDTOForm jobOfferDTOForm)
        {
            Status = jobOfferDTOForm.Status;
            PublicationDate = jobOfferDTOForm.PublicationDate;
            DeadlineDate = jobOfferDTOForm.DeadlineDate;
            Duration = jobOfferDTOForm.Duration;
            RecruitmentRequestId = jobOfferDTOForm.RecruitmentRequestId;
            RequesterId = jobOfferDTOForm.RequesterId;
            CreatedAt = DateTime.UtcNow;

        }
    }
}
