using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyApp.Api.Entities.recruitment;

[Table("contract_types")]
public class ContractType : BaseEntity
{
    [Key]
    [Column("contract_type_id")]
    public string Id {get; set;} = null!;

    [Column("code")]
    public string Code {get; set;} = null!;

    [Column("label")]
    public string Name {get; set;} = null!;
}
