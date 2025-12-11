using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MyApp.Api.Entities.contract;
using MyApp.Api.Entities.users;

namespace MyApp.Api.Entities.recruitment;

[Table("recruitment_requests")]
public class RecruitmentRequest : BaseEntity
{
    [Key]
    [Column("request_id")]
    public string Id {get; set;} = null!;

    [Column("post_name")]
    public string Post {get; set;} = null!;

    [Column("effective")]
    public short Effective {get; set;}

    [Column("month_duration")]
    public short? MonthDuration {get; set;}

    [Column("begining_date")]
    public DateOnly BeginningDate {get; set;}


    [Column("is_replacement")]
    public bool IsReplacement {get; set;}

    [Column("replacement_date")]
    public DateOnly? ReplacementDate {get; set;}


    [ForeignKey("applicant_user")]
    public User ApplicantUser {get; set;} = null!;

    [ForeignKey("replacement_reason_id")]
    public ReplacementReason? ReplacementReason {get; set;}

    [Column("reason_precision")]
    public string? ReasonPrecision {get; set;}

    [ForeignKey("last_titular_user")]
    public User? LastTitular {get; set;}


    [ForeignKey("contract_type_id")]
    public ContractType? Contract {get; set;}

    [Column("contract_precision")]
    public string? ContractPrecision {get; set;}


    [Column("is_planned")]
    public bool IsPlanned {get; set;}

    [Column("not_planned_reason")]
    public string? NotPlannedReason {get; set;}


    [Column("is_deleted")]
    public bool IsDeleted  { get; set; } = false;
}
