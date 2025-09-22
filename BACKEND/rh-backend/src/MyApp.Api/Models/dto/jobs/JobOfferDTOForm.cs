using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.jobs
{
    public class JobOfferSearchDTO
    {
        public string? Status { get; set; }

        public string? JobTitleKeyword { get; set; }

        public DateTime? PublicationDateMin { get; set; }

        public DateTime? PublicationDateMax { get; set; }

        public string? SiteId { get; set; }

        public string? ContractTypeId { get; set; }
    }
    public class JobOfferDTO
    {

        [MaxLength(20)]
        public string? Status { get; set; }

        public DateTime? PublicationDate { get; set; }

        public DateTime? DeadlineDate { get; set; }

        public int? Duration { get; set; }

    }
    public class JobOfferDTOForm : JobOfferDTO
    {

        [Required]
        [MaxLength(50)]
        public string RecruitmentRequestId { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string RequesterId { get; set; } = null!;

    }

    public class CreateJobOfferRequest
    {
        public JobOfferDTOForm Offer { get; set; } = null!;
        public JobDescriptionDTO Description { get; set; } = null!;
    }

    public class JobOfferStats
    {
        public int Total { get; set; }
        public int Publiee { get; set; }
        public int EnCours { get; set; }
        public int Cloturee { get; set; }
        public int Annulee { get; set; }
    }
}
