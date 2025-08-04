using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.form.mission;

public class MissionAssignationDTOForm
{
    [Required(ErrorMessage = "L'identifiant de l'employé est requis.")]
    [MaxLength(50, ErrorMessage = "L'identifiant de l'employé ne peut pas dépasser 50 caractères.")]
    public string EmployeeId { get; set; } = null!;

    public string MissionId { get; set; } = null!;
    
    [MaxLength(50, ErrorMessage = "L'identifiant du transport ne peut pas dépasser 50 caractères.")]
    public string? TransportId { get; set; }

    [Required(ErrorMessage = "La date de départ est requise.")]
    public DateTime? DepartureDate { get; set; }

    // Optional fields – no validation attributes required unless needed
    public TimeSpan? DepartureTime { get; set; }

    public DateTime? ReturnDate { get; set; }

    public TimeSpan? ReturnTime { get; set; }

    public int? Duration { get; set; }
}