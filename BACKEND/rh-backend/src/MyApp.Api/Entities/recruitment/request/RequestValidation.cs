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

    [Column("signature_url")]
    public string Signature {get; set;} = null!;

    [Column("comments")]
    public string? Comments {get; set;}

    [ForeignKey("user_id")]
    public User Validator {get; set;} = null!;

    [ForeignKey("status_id")]
    public RequestStatus Status {get; set;} = null!;

    [ForeignKey("request_id")]
    public RecruitmentRequest Request {get; set;} = null!;
}
