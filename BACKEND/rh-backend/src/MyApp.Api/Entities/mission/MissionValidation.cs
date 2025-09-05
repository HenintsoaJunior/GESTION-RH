using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.employee;
using MyApp.Api.Entities.users;
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

        [Column("status")]
        [MaxLength(50)]
        public string? Status { get; set; }

        [Column("to_whom")]
        [MaxLength(50)]
        public string? ToWhom { get; set; }

        [Column("validation_date")]
        public DateTime? ValidationDate { get; set; }

        [Required]
        [Column("mission_creator")]
        [MaxLength(50)]
        public string MissionCreator { get; set; } = null!;

        [ForeignKey("MissionCreator")]
        public User? User { get; set; }   

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
        [Column("drh_id")]
        [MaxLength(250)]
        public string? DrhId {  get; set; }
        
        [ForeignKey("DrhId")]
        public User? Drh { get; set; }
        
        [Column("superior_id")]
        [MaxLength(250)]
        public string? SuperiorId {  get; set; }
        
        [ForeignKey("SuperiorId")]
        public User? Superior { get; set; }
        public MissionValidation()
        {
        }

        public MissionValidation(MissionValidationDTOForm dto)
        {
            MissionId = dto.MissionId;
            MissionAssignationId = dto.MissionAssignationId;
            MissionCreator = dto.MissionCreator;
            DrhId = dto.DhrId;
            SuperiorId = dto.SuperiorId;
            Status = dto.Status;
            ToWhom = dto.ToWhom;
            ValidationDate = dto.ValidationDate;
        }
    }
}