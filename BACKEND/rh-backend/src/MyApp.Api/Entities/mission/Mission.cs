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
        
        [Column("status")]
        [MaxLength(10)]
        public string Status { get; set; } = "En Cours";
        
        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("site")]
        [MaxLength(255)]
        public string Site { get; set; } = null!;

        public Mission()
        {
        }
        public Mission(MissionDTOForm  mission)
        {
            MissionId = mission.MissionId;
            Name = mission.Name;
            Description = mission.Description;
            StartDate = mission.StartDate;
            Site = mission.Site;
        }
    }
}
