using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.users;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Entities.mission
{
    [Table("mission_report")]
    public class MissionReport : BaseEntity
    {
        [Key]
        [Column("mission_report_id")]
        [MaxLength(50)]
        public string MissionReportId { get; set; } = null!;

        [Required]
        [Column("text")]
        public string Text { get; set; } = string.Empty;

        [Required]
        [Column("user_id")]
        [MaxLength(50)]
        public string UserId { get; set; } = null!;

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        [Column("mission_id")]
        [MaxLength(50)]
        public string MissionId { get; set; } = null!;

        [ForeignKey("MissionId")]
        public Mission? Mission { get; set; }

        public MissionReport() { }

        public MissionReport(MissionReportDTOForm dto)
        {
            Text = dto.Text;
            UserId = dto.UserId;
            MissionId = dto.MissionId;
        }
    }
}