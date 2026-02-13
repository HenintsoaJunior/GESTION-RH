using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.recruitment;

public class RequestFormDTO
{
    [Required(ErrorMessage = "Nom du poste obligatoire")]
    public string Post {get; set;} = null!;

    [Required(ErrorMessage = "Effectif obligatoire")]
    [Range(0, short.MaxValue, ErrorMessage = "Effectif doit être positif")]
    public short Effective {get; set;}

    public string[] Sites {get; set;} = [];

    [Required(ErrorMessage = "Remplacement ou pas obligatoire")]
    public bool IsReplacement {get; set;}
    public DateOnly? ReplacementDate {get; set;}
    public string? ReplacementReasonId {get; set;}
    public string? ReasonPrecision {get; set;}
    public string? LastTitularId {get; set;}

    public string? ContractId {get; set;} = null!;
    public string? ContractPrecision {get; set;}
    public short? MonthDuration {get; set;}

    [Required(ErrorMessage = "Date de prise de service obligatoire")]
    public DateOnly BeginningDate {get; set;}

    public string Direction { get; set; } = null!;
    public string ApplicantUserId { get; set; } = null!;
    public string HierarchicalManagerId {get; set;} = null!;
    public string FunctionalManagerId {get; set;} = null!;
    public string CreatorId {get; set;} = null!;

    [Required(ErrorMessage = "Dotation au budget obligatoire")]
    public bool IsPlanned {get; set;}
    public string? NotPlannedReason {get; set;}
}


public class RequestEditDTO
{
    public string Id { get; set; } = null!;

    public string Post { get; set; } = null!;
    public short Effective { get; set; }

    public string? ContractId { get; set; }
    public string? ContractPrecision { get; set; }
    public short? MonthDuration { get; set; }

    public string[] Sites { get; set; } = [];

    public bool IsReplacement { get; set; }
    public string? ReplacementReasonId { get; set; }
    public DateOnly? ReplacementDate { get; set; }
    public string? ReasonPrecision { get; set; }
    public string? LastTitularId { get; set; }

    public bool IsPlanned { get; set; }
    public string? NotPlannedReason { get; set; }

    public DateOnly BeginningDate { get; set; }

    public string Direction { get; set; } = null!;
    public string ApplicantUserId { get; set; } = null!;
    public string HierarchicalManagerId { get; set; } = null!;
    public string FunctionalManagerId {get; set;} = null!;
    public string CreatorId {get; set;} = null!;
}
