using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.contract;
using MyApp.Api.Entities.site;
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
        [Column("contract_type_id")]
        [MaxLength(50)]
        public string ContractTypeId { get; set; } = null!;

        [Required]
        [Column("site_id")]
        [MaxLength(50)]
        public string SiteId { get; set; } = null!;

        [Required]
        [Column("description_id")]
        [MaxLength(50)]
        public string DescriptionId { get; set; } = null!;

        [ForeignKey("ContractTypeId")]
        public ContractType? ContractType { get; set; }

        [ForeignKey("SiteId")]
        public Site? Site { get; set; }

        [ForeignKey("DescriptionId")]
        public JobDescription? JobDescription { get; set; }

        public JobOffer() { }
        public JobOffer(JobOfferDTOForm jobOfferDTOForm)
        {
            OfferId = jobOfferDTOForm.OfferId;
            Status = jobOfferDTOForm.Status;
            PublicationDate = jobOfferDTOForm.PublicationDate;
            DeadlineDate = jobOfferDTOForm.DeadlineDate;
            Duration = jobOfferDTOForm.Duration;
            ContractTypeId = jobOfferDTOForm.ContractTypeId;
            SiteId = jobOfferDTOForm.SiteId;
            DescriptionId = jobOfferDTOForm.DescriptionId;
        }
    }
}
