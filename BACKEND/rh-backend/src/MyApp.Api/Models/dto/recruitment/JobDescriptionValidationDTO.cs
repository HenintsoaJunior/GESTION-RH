using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.recruitment;

public class JobDescriptionValidationDTO
{
    [Required(ErrorMessage = "Référence du TDR obligatoire")]
    public string JobDescId {get; set;} = null!;

    [Required(ErrorMessage = "Validateur obligatoire")]
    public string ValidatorId {get; set;} = null!;
}
