using System.ComponentModel.DataAnnotations;
using MyApp.Api.Models.parent.Jobs;

namespace MyApp.Model.form.Jobs
{
    public class JobDescriptionDTOForm : JobDescriptionDTO
    {
        [Required]
        [MaxLength(50)]
        public string OrganigramId { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string HierarchicalAttachmentId { get; set; } = null!;

        [Required]
        [MaxLength(50)]
        public string SiteId { get; set; } = null!;
    }
}
