using System.ComponentModel.DataAnnotations;

namespace MyApp.Api.Models.form.mission;

public class MissionAssignationDTOForm
{
    [Required]
    [MaxLength(50)]
    public string EmployeeId { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string MissionId { get; set; } = null!;
    
    [MaxLength(50)]
    public string? TransportId { get; set; }

    [Required]
    public DateTime DepartureDate { get; set; }

    public TimeSpan? DepartureTime { get; set; }
    public DateTime? ReturnDate { get; set; }
    public TimeSpan? ReturnTime { get; set; }
    public int? Duration { get; set; }
}