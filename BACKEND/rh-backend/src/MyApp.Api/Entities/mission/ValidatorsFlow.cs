using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.validatorsflow;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.mission
{
    [Table("validators_flow")]
    public class ValidatorsFlow : BaseEntity
    {
        [Key]
        [Column("validator_id")]
        [MaxLength(50)]
        public string ValidatorId { get; set; } = null!;

        [Column("validator_type")]
        [MaxLength(50)]
        [Required]
        public string ValidatorType { get; set; } = string.Empty;

        [Column("user_id")]
        [MaxLength(250)]
        [Required]
        public string UserId { get; set; } = null!;

        [Column("department")]
        [MaxLength(50)]
        [Required]
        public string Department { get; set; } = null!;

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Column("backup_order")]
        [Required]
        public int BackupOrder { get; set; } = 0;

        [Column("superior_id")]
        [MaxLength(250)]
        public string? SuperiorId { get; set; }

        [ForeignKey("SuperiorId")]
        public User? Superior { get; set; }

        public ValidatorsFlow()
        {
        }

        public ValidatorsFlow(ValidatorsFlowDTOForm dto)
        {
            ValidatorType = dto.ValidatorType ?? throw new ArgumentNullException(nameof(dto.ValidatorType));
            UserId = dto.UserId ?? throw new ArgumentNullException(nameof(dto.UserId));
            BackupOrder = dto.BackupOrder;
            SuperiorId = dto.SuperiorId;
            Department = dto.Department;
        }
    }
}