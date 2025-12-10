using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.recruitment;

public class CreateRequestValidationDTO
{
    [Required(ErrorMessage = "Référence de la demande obligatoire")]
    public string RequestId {get; set;} = null!;

    [Required(ErrorMessage = "Validateur obligatoire")]
    public string ValidatorId {get; set;} = null!;

    [Required(ErrorMessage = "Décision du validateur obligatoire")]
    public string Status {get; set;} = null!;

    public string? Signature {get; set;}

    public string? Comments {get; set;}
}
