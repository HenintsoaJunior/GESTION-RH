using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.site;
using MyApp.Api.Models.form.mission;

namespace MyApp.Api.Entities.mission
{
    [Table("mission")]
    public class Mission : BaseEntity
    {
        [Key]
        [Column("mission_id")]
        [MaxLength(50)]
        public string MissionId { get; set; } = null!;

        [Required]
        [Column("name")]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Column("description", TypeName = "text")]
        public string? Description { get; set; }

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Required]
        [Column("site_id")]
        [MaxLength(50)]
        public string SiteId { get; set; } = null!;

        [ForeignKey("SiteId")]
        public Site? Site { get; set; }

        public Mission()
        {
        }
        public Mission(MissionDTOForm  mission)
        {
            MissionId = mission.MissionId;
            Description = mission.Description;
            StartDate = mission.StartDate;
            SiteId = mission.SiteId;
        }
    }
}
