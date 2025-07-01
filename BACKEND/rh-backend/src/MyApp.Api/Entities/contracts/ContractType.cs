using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.contracts
{
    [Table("contract_types")]
    public class ContractType : BaseEntity
    {
        [Key]
        [Column("contract_type_id")]
        [MaxLength(50)]
        public string ContractTypeId { get; set; } = null!;

        [Required]
        [Column("contract_type_name")]
        [MaxLength(50)]
        public string ContractTypeName { get; set; } = null!;
    }
}