using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.validatorsflow
{
    public class ValidatorsFlowDTOForm
    {
        [Required]
        [MaxLength(50)]
        public string ValidatorType { get; set; } = string.Empty;

        [Required]
        [MaxLength(250)]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Department { get; set; } = string.Empty;

        [Required]
        public int BackupOrder { get; set; } = 0;

        [MaxLength(250)]
        public string? SuperiorId { get; set; }
    }

    public class ValidatorsFlowDTO : ValidatorsFlowDTOForm
    {
        public string ValidatorId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? UserName { get; set; }
        public string? SuperiorName { get; set; }
    }

    public class ValidatorsFlowSearchFiltersDTO
    {
        public string? ValidatorType { get; set; }
        public string? UserId { get; set; }
        public string? SuperiorId { get; set; }
        public int? MinBackupOrder { get; set; }
        public int? MaxBackupOrder { get; set; }
    }
}