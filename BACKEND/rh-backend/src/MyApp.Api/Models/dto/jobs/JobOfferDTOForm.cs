using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.jobs
{
    public class JobOfferDTO
    {
        [MaxLength(50)]
        public string OfferId { get; set; } = null!;

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
        public string ContractTypeId { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string SiteId { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string DescriptionId { get; set; } = null!;

    }
}
