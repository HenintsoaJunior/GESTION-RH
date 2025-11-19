using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.contract
{
    public class CreateContractTypeDTO
    {
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Label { get; set; } = string.Empty;
    }
}