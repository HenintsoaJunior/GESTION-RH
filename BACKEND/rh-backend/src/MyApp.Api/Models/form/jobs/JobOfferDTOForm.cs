using System.ComponentModel.DataAnnotations;
using MyApp.Api.Models.parent.jobs;

namespace MyApp.Api.Models.form.jobs
{
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
