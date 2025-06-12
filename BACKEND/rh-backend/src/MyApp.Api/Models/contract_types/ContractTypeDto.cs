using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.contract_types
{
    public class ContractTypeDto
    {
        [Required]
        [MaxLength(50)]
        public string ContractTypeId { get; set; } = default!;

        [Required]
        [MaxLength(50)]
        public string ContractTypeName { get; set; } = default!;
    }
}