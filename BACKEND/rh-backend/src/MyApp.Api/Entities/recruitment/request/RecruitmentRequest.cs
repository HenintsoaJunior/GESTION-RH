using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
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


    [Column("applicant_user_id")]
    public string ApplicantUserId {get; set;} = null!;

    [ForeignKey(nameof(ApplicantUserId))]
    public User ApplicantUser {get; set;} = null!;


    [Column("hierarchical_manager_id")]
    public string HierarchicalManagerId {get; set;} = null!;

    [ForeignKey(nameof(HierarchicalManagerId))]
    public User HierarchicalManager {get; set;} = null!;


    [Column("functional_manager_id")]
    public string FunctionalManagerId {get; set;} = null!;

    [ForeignKey(nameof(FunctionalManagerId))]
    public User FunctionalManager {get; set;} = null!;


    [Column("created_by")]
    public string CreatorId {get; set;} = null!;

    [ForeignKey(nameof(CreatorId))]
    public User Creator {get; set;} = null!;


    [Column("replacement_reason_id")]
    public string? ReplacementReasonId {get; set;}

    [ForeignKey(nameof(ReplacementReasonId))]
    public ReplacementReason? ReplacementReason {get; set;}


    [Column("reason_precision")]
    public string? ReasonPrecision {get; set;}

    [Column("last_titular_user")]
    public string? LastTitularUserId {get; set;}

    [ForeignKey(nameof(LastTitularUserId))]
    public User? LastTitular {get; set;}


    [Column("contract_type_id")]
    public string? ContractTypeId {get; set;}

    [ForeignKey(nameof(ContractTypeId))]
    public ContractType? Contract {get; set;}


    [Column("contract_precision")]
    public string? ContractPrecision {get; set;}

    [Column("is_planned")]
    public bool IsPlanned {get; set;}

    [Column("not_planned_reason")]
    public string? NotPlannedReason {get; set;}

    [Column("last_status")]
    public string LastStatus {get; set;} = null!;

    [Column("is_deleted")]
    public bool IsDeleted  { get; set; } = false;

    [JsonIgnore]
    public List<SiteRequest> SitesRequests { get; set; }
     = new List<SiteRequest>();

    [JsonIgnore]
    public ICollection<RequestsPerValidator> RequestsPerValidators { get; set; }
    = new List<RequestsPerValidator>();
}
