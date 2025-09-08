using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.dto.transport;

public class TransportDTOForm
{

    [Required(ErrorMessage = "Le type du lieu est requis.")]
    public required string Type { get; set; }
}