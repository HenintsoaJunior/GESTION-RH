using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.recruitment;

[Table("requests_validations")]
public class RequestValidation : BaseEntity
{
    [Key]
    [Column("request_validation_id")]
    public string Id {get; set;} = null!;

    [Column("comments")]
    public string? Comments {get; set;}


    [Column("user_id")]
    public string ValidatorId {get; set;} = null!;
    
    [ForeignKey(nameof(ValidatorId))]
    public User Validator {get; set;} = null!;


    [Column("status_id")]
    public string StatusId {get; set;} = null!;

    [ForeignKey(nameof(StatusId))]
    public RequestStatus Status {get; set;} = null!;


    [Column("request_id")]
    public string RequestId {get; set;} = null!;

    [ForeignKey(nameof(RequestId))]
    public RecruitmentRequest Request {get; set;} = null!;
}
