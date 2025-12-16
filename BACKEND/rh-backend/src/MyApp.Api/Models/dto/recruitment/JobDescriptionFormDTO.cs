using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.recruitment;

public class JobDescriptionFormDTO
{
// Info générales
    [Required(ErrorMessage = "Demande de recrutement obligatoire")]
    public string RequestId { get; set; } = null!;

    [Required(ErrorMessage = "Mission obligatoire")]
    public string Mission { get; set; } = null!;

    [Required(ErrorMessage = "Les attributions sont obligatoires.")]
    public string[] Attributions { get; set; } = null!;


// Formations et Expériences Pro
    


// Qualités perso et compétences
}
