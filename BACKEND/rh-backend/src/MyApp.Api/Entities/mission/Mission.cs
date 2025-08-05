using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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

        [Column("description")]
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        [Column("status")]
        [MaxLength(10)]
        public string Status { get; set; } = "En Cours";
        
        [Column("start_date")]
        public DateTime? StartDate { get; set; }
        
        [Column("end_date")]
        public DateTime? EndtDate { get; set; }
        
        [Column("lieu_id", Order = 0)]
        [MaxLength(50)]
        public string LieuId { get; set; } = null!;
        
        [ForeignKey("LieuId")]
        public Lieu? Lieu { get; set; }
        
        public Mission()
        {
        }
        public Mission(MissionDTOForm  mission)
        {
            Name = mission.Name;
            Description = mission.Description;
            StartDate = mission.StartDate;
            EndtDate = mission.EndDate;
            LieuId = mission.LieuId;
        }
    }
}
