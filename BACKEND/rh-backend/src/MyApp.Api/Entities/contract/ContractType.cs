using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.contract
{
    [Table("contract_types")]
    public class ContractType : CodeLabel
    {
        [Key]
        [Column("contract_type_id")]
        [MaxLength(50)]
        public string ContractTypeId { get; set; } = null!;
    }
}