using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.recruitment;

public class RequestFormDTO
{
    [Required(ErrorMessage = "Nom du poste obligatoire")]
    public string Post {get; set;} = null!;

    [Required(ErrorMessage = "Effectif obligatoire")]
    public int Effective {get; set;}

    [Required(ErrorMessage = "Remplacement obligatoire")]
    public bool IsReplacement {get; set;}
    public DateOnly? ReplacementDate {get; set;}
    public string? ReplacementReasonId {get; set;}
    public string? LastTitularId {get; set;}

    [Required(ErrorMessage = "Type du contrat obligatoire")]
    public string ContractId {get; set;} = null!;
    public string? ContractPrecision {get; set;}
    public int? MonthDuration {get; set;}

    [Required(ErrorMessage = "Date de prise de service obligatoire")]
    public DateOnly BeginingDate {get; set;}

    public string ApplicantUserId {get; set;} = null!;
}
