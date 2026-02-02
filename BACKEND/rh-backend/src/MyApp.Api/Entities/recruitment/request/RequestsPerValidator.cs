using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.recruitment;

[Table("requests_per_validators")]
public class RequestsPerValidator
{
    [Key]
    [Column("requests_per_validator_id")]
    public string Id {get; set;} = null!;


    [Column("request_id")]
    public string RequestId {get; set;} = null!;

    [ForeignKey(nameof(RequestId))]
    public RecruitmentRequest Request {get; set;} = null!;


    [Column("validator_id")]
    public string ValidatorId {get; set;} = null!;

    [ForeignKey(nameof(ValidatorId))]
    public User Validator {get; set;} = null!;


    [Column("is_validated")]
    public bool IsValidated {get; set;} = false;
}
