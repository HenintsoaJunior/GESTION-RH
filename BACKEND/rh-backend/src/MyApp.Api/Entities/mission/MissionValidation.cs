using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.employee;
using MyApp.Api.Models.dto.mission;

namespace MyApp.Api.Entities.mission
{
    [Table("mission_validation")]
    public class MissionValidation : BaseEntity
    {
        [Key]
        [Column("mission_validation_id")]
        [MaxLength(50)]
        public string MissionValidationId { get; set; } = null!;

        [Required]
        [Column("mission_id")]
        [MaxLength(50)]
        public string MissionId { get; set; } = null!;

        [ForeignKey("MissionId")]
        public Mission? Mission { get; set; }

        [Required]
        [Column("mission_assignation_id")]
        [MaxLength(50)]
        public string MissionAssignationId { get; set; } = null!;

        [ForeignKey("MissionAssignationId")]
        public MissionAssignation? MissionAssignation { get; set; }

        [Required]
        [Column("mission_creator")]
        [MaxLength(50)]
        public string MissionCreator { get; set; } = null!;

        [ForeignKey("MissionCreator")]
        public Employee? Employee { get; set; }

        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "En Attente";

        [Column("to_whom")]
        [MaxLength(50)]
        public string? ToWhom { get; set; }

        [Column("validation_date")]
        public DateTime? ValidationDate { get; set; }

        public MissionValidation()
        {
        }

        public MissionValidation(MissionValidationDTOForm missionValidationDto)
        {
            MissionId = missionValidationDto.MissionId;
            MissionAssignationId = missionValidationDto.MissionAssignationId;
            MissionCreator = missionValidationDto.MissionCreator;
            Status = missionValidationDto.Status ?? "En Attente";
            ToWhom = missionValidationDto.ToWhom;
            ValidationDate = missionValidationDto.ValidationDate;
        }
    }
}