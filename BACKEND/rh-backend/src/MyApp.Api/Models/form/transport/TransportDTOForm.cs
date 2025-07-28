using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.form.transport;

public class TransportDTOForm
{

    [Required(ErrorMessage = "Le type du lieu est requis.")]
    public required string Type { get; set; }
}