using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Models.dto.contract;

namespace MyApp.Api.Entities.contract
{
    [Table("contract_types")]
    public class ContractType : CodeLabel
    {
        [Key]
        [Column("contract_type_id")]
        [MaxLength(50)]
        public string ContractTypeId { get; set; } = null!;

        public ContractType()
        {
        }

        public ContractType(CreateContractTypeDTO dto)
        {
            Code = dto.Code ?? throw new ArgumentNullException(nameof(dto.Code));
            Label = dto.Label ?? throw new ArgumentNullException(nameof(dto.Label));
        }
    }
}